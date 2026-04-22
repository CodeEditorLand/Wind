/**
 * @module Effect/IPC/Implementation/TauriIPC
 * @description
 * Tauri-based IPC service implementation using Tauri's invoke and API.
 * @see {@link Effect/IPC/Interface/IPCService} Service interface
 * @category Implementation
 */

import { invoke as tauriInvoke, type InvokeArgs } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";
import { Effect, Stream } from "effect";

import { SandboxNotReadyError } from "../../../Types/Sandbox.js";
import {
	CreateIPCInvokeError,
	CreateIPCSendError,
	CreateIPCSubscriptionError,
	type IPCInvokeError,
	type IPCSendError,
	type IPCSubscriptionError,
} from "../Error/IPCError.js";
import type { IPCService } from "../Interface/IPCService.js";

// ============================================================================
// Tauri Implementation
// ============================================================================

/**
 * Tauri IPC service implementation
 */
export const TauriIPCLive = Effect.gen(function* () {
	// Verify Tauri is available
	const isTauriAvailable =
		typeof window !== "undefined" &&
		(window as any).__TAURI__ !== undefined;

	if (!isTauriAvailable) {
		return yield* Effect.die(new SandboxNotReadyError());
	}

	const service: IPCService = {
		send: (channel: string) => (args: ReadonlyArray<unknown>) =>
			Effect.try({
				try: () => emit(channel, args.length === 1 ? args[0] : args),
				catch: (error) => CreateIPCSendError(channel, error),
			}),

		invoke: (channel: string) => (args: ReadonlyArray<unknown>) =>
			Effect.tryPromise({
				try: () => {
					// All Wind IPC calls route through the single
					// `MountainIPCInvoke` Tauri command (registered in
					// `Binary/Main/Entry.rs::invoke_handler!`; implementation
					// in `Binary/IPC/InvokeCommand.rs`). Tauri's default
					// snake-case auto-conversion means `"mountain_ipc_invoke"`
					// also resolves - but every other call site in Wind /
					// Sky / Output uses the PascalCase form, so stay
					// consistent with those.
					// Mountain receives: method = channel name, params = args
					// array. Send as array so Mountain can always destructure
					// positionally; single-element arrays preserved; empty
					// stays [].
					const params: unknown =
						args.length === 0
							? []
							: args.length === 1
								? args[0]
								: Array.from(args);
					return tauriInvoke("MountainIPCInvoke", {
						method: channel,
						params,
					});
				},
				catch: (error) => CreateIPCInvokeError(channel, error),
			}),

		events: (
			channel: string,
		): Stream.Stream<
			{ readonly channel: string; readonly args: ReadonlyArray<unknown> },
			IPCSubscriptionError
		> =>
			Stream.async((emit) => {
				let cleanup: (() => void) | undefined;

				listen(channel, (event) => {
					emit.single({
						channel,
						args: [event.payload],
					});
				})
					.then((unlisten) => {
						cleanup = unlisten;
					})
					.catch((error) => {
						emit.fail(CreateIPCSubscriptionError(channel, error));
					});

				return Effect.sync(() => cleanup?.());
			}),

		once: (
			channel: string,
		): Effect.Effect<
			{ readonly channel: string; readonly args: ReadonlyArray<unknown> },
			IPCSubscriptionError
		> =>
			Effect.async((resume) => {
				listen(channel, (event) => {
					resume(
						Effect.succeed({
							channel,
							args: [event.payload],
						}),
					);
				}).catch((error) => {
					resume(
						Effect.fail(CreateIPCSubscriptionError(channel, error)),
					);
				});
			}),

		removeAllListeners: (channel: string) =>
			Effect.log(`[IPC] Remove all listeners for ${channel}`).pipe(
				Effect.map(() => undefined),
			),
	};

	return service;
});

export default TauriIPCLive;
