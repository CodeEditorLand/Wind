/**
 * @module Effect/IPC/Implementation/TauriIPC
 * @description
 * Tauri-based IPC service implementation using Tauri's invoke and API.
 * All methods are plain async — no Effect wrappers.
 * @see {@link Effect/IPC/Interface/IPCService} Service interface
 * @category Implementation
 */

import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";

import {
	IPCInvokeError,
	IPCSendError,
	IPCSubscriptionError,
} from "../Error/IPCError.js";
import type {
	IPCService,
	IPCEventListener,
	IPCEventStream,
} from "../Interface/IPCService.js";

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
	const invoke = async (
		channel: string,
		args: ReadonlyArray<unknown>,
	): Promise<unknown> => {
		try {
			// All Wind IPC calls route through the single
			// `MountainIPCInvoke` Tauri command. Mountain receives:
			// method = channel name, params = flat array of args -
			// the same shape TauriMainProcessService produces.
			// Always sending the array keeps a single array-valued
			// argument (e.g. `[uris]`) from being unwrapped and
			// spread into multiple Mountain-side args; Mountain
			// wraps non-array params itself, so bare values were
			// never required here.
			return await tauriInvoke("MountainIPCInvoke", {
				method: channel,
				params: args as unknown[],
			});
		} catch (error) {
			throw new IPCInvokeError(channel, error);
		}
	};

	const send = (channel: string, args: ReadonlyArray<unknown>): void => {
		try {
			emit(channel, args.length === 1 ? args[0] : args);
		} catch (error) {
			throw new IPCSendError(channel, error);
		}
	};

	const events = (channel: string): IPCEventStream => {
		// Track listeners to allow individual cleanup
		const listeners = new Set<IPCEventListener>();

		let tauriUnlisten: (() => void) | undefined;

		// Set up the Tauri listener once
		listen(channel, (event) => {
			const ipcEvent = {
				channel,
				args: [event.payload],
			};

			for (const listener of listeners) {
				try {
					listener(ipcEvent);
				} catch {
					// Don't let one listener's error break others
				}
			}
		})
			.then((unlisten) => {
				tauriUnlisten = unlisten;
				RegisterUnlisten(channel, unlisten);
			})
			.catch((_error) => {
				// Subscription failed silently — the Tauri listener
				// never started, so nothing to clean up.
			});

		const subscribe = (listener: IPCEventListener): (() => void) => {
			listeners.add(listener);

			return () => {
				listeners.delete(listener);

				// If no listeners remain, clean up the Tauri listener
				if (listeners.size === 0 && tauriUnlisten) {
					UnregisterUnlisten(channel, tauriUnlisten);
					tauriUnlisten();
					tauriUnlisten = undefined;
				}
			};
		};

		return { subscribe };
	};

	const once = async (
		channel: string,
		callback: IPCEventListener,
	): Promise<void> => {
		try {
			const unlisten = await listen(channel, (event) => {
				callback({
					channel,
					args: [event.payload],
				});

				// Auto-cleanup after first event
				unlisten();
				UnregisterUnlisten(channel, unlisten);
			});

			RegisterUnlisten(channel, unlisten);
		} catch (error) {
			throw new IPCSubscriptionError(channel, error);
		}
	};

	const removeAllListeners = (channel: string): void => {
		const Unlisteners = ChannelUnlisteners.get(channel);

		if (!Unlisteners) return;

		ChannelUnlisteners.delete(channel);

		for (const Unlisten of Unlisteners) {
			try {
				Unlisten();
			} catch {}
		}
	};

	return {
		send,
		invoke,
		events,
		once,
		removeAllListeners,
	};
}

/**
 * Tauri IPC service implementation — plain object, no Effect layers
 */
export const TauriIPCLive = buildTauriIPCService();

export default TauriIPCLive;
