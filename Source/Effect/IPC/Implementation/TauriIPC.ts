/**
 * @module Effect/IPC/Implementation/TauriIPC
 * @description
 * Tauri-based IPC service implementation using Tauri's invoke and API.
 * @see {@link Effect/IPC/Interface/IPCService} Service interface
 * @category Implementation
 */

import { Effect, Stream } from "effect";
import type { IPCService } from "../Interface/IPCService.js";
import type { IPCInvokeError, IPCSendError, IPCSubscriptionError } from "../Error/IPCError.js";
import {
	createIPCInvokeError,
	createIPCSendError,
	createIPCSubscriptionError,
} from "../Error/IPCError.js";
import { emit, listen } from "@tauri-apps/api/event";
import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import type { InvokeArgs } from "@tauri-apps/api/core";
import { SandboxNotReadyError } from "../../../Types/Sandbox.js";

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
				catch: (error) => createIPCSendError(channel, error),
			}),

		invoke: (channel: string) => (args: ReadonlyArray<unknown>) =>
			Effect.tryPromise({
				try: () => {
					const invokeArgs: InvokeArgs | undefined = args.length === 1
						? (args[0] as InvokeArgs)
						: (args as unknown as InvokeArgs);
					return tauriInvoke(channel, invokeArgs);
				},
				catch: (error) => createIPCInvokeError(channel, error),
			}),

		events: (channel: string): Stream.Stream<
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
						emit.fail(createIPCSubscriptionError(channel, error));
					});

				return Effect.sync(() => cleanup?.());
			}),

		once: (channel: string): Effect.Effect<
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
						Effect.fail(createIPCSubscriptionError(channel, error)),
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
