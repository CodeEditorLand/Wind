/**
 * @module Effect/IPC/Implementation/TauriIPC
 * @description
 * Tauri-based IPC service implementation using Tauri's invoke and API.
 * @see {@link Effect/IPC/Interface/IPCService} Service interface
 * @category Implementation
 */

import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";
import { Effect, Stream } from "effect";

import {
	CreateIPCInvokeError,
	CreateIPCSendError,
	CreateIPCSubscriptionError,
	type IPCSubscriptionError,
} from "../Error/IPCError.js";
import type { IPCService } from "../Interface/IPCService.js";

// ============================================================================
// Tauri Implementation
// ============================================================================

function buildTauriIPCService(): IPCService {
	return {
		send: (channel: string) => (args: ReadonlyArray<unknown>) =>
			Effect.try({
				try: () => emit(channel, args.length === 1 ? args[0] : args),
				catch: (error) => CreateIPCSendError(channel, error),
			}),

		invoke: (channel: string) => (args: ReadonlyArray<unknown>) =>
			Effect.tryPromise({
				try: () => {
					// All Wind IPC calls route through the single
					// `MountainIPCInvoke` Tauri command. Mountain receives:
					// method = channel name, params = args array.
					// Pass args directly when length !== 1; Tauri's serde
					// handles ReadonlyArray<unknown> identically to unknown[].
					return tauriInvoke("MountainIPCInvoke", {
						method: channel,
						params: args.length === 1 ? args[0] : args,
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

		removeAllListeners: (_channel: string) => Effect.void,
	};
}

/**
 * Tauri IPC service implementation
 */
export const TauriIPCLive = buildTauriIPCService();

export default TauriIPCLive;
