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

// Unlisten functions per channel, captured when `listen()` resolves in
// `events`/`once`, so `removeAllListeners` can actually detach Tauri
// listeners instead of letting them accumulate across reloads.
const ChannelUnlisteners = new Map<string, Array<() => void>>();

const RegisterUnlisten = (channel: string, unlisten: () => void): void => {
	const Existing = ChannelUnlisteners.get(channel);

	if (Existing) {
		Existing.push(unlisten);
	} else {
		ChannelUnlisteners.set(channel, [unlisten]);
	}
};

const UnregisterUnlisten = (channel: string, unlisten: () => void): void => {
	const Existing = ChannelUnlisteners.get(channel);

	if (!Existing) return;

	const Index = Existing.indexOf(unlisten);

	if (Index !== -1) Existing.splice(Index, 1);

	if (Existing.length === 0) ChannelUnlisteners.delete(channel);
};

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
					// method = channel name, params = flat array of args -
					// the same shape TauriMainProcessService produces.
					// Always sending the array keeps a single array-valued
					// argument (e.g. `[uris]`) from being unwrapped and
					// spread into multiple Mountain-side args; Mountain
					// wraps non-array params itself, so bare values were
					// never required here.
					return tauriInvoke("MountainIPCInvoke", {
						method: channel,
						params: args as unknown[],
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

						RegisterUnlisten(channel, unlisten);
					})
					.catch((error) => {
						emit.fail(CreateIPCSubscriptionError(channel, error));
					});

				return Effect.sync(() => {
					if (cleanup) {
						UnregisterUnlisten(channel, cleanup);

						cleanup();
					}
				});
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
				})
					.then((unlisten) => {
						RegisterUnlisten(channel, unlisten);
					})
					.catch((error) => {
						resume(
							Effect.fail(
								CreateIPCSubscriptionError(channel, error),
							),
						);
					});
			}),

		removeAllListeners: (channel: string) =>
			Effect.sync(() => {
				const Unlisteners = ChannelUnlisteners.get(channel);

				if (!Unlisteners) return;

				ChannelUnlisteners.delete(channel);

				for (const Unlisten of Unlisteners) {
					try {
						Unlisten();
					} catch {}
				}
			}),
	};
}

/**
 * Tauri IPC service implementation
 */
export const TauriIPCLive = buildTauriIPCService();

export default TauriIPCLive;
