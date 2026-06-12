/**
 * @module Effect/Mountain/Implementation/MountainImplementation
 * @description
 * Main implementation of Mountain service with connection management and sync.
 * Connection state lives in the closure; listeners are notified on every
 * transition. Connect retries with capped exponential backoff and the
 * background configuration sync runs as a stored Promise loop cancelled
 * through an AbortController.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface
 * @category Implementation
 */

import { invoke as TauriInvoke } from "@tauri-apps/api/core";

import DevLog from "../../../Function/DevLog.js";

import Channel from "../../../IPC/Channel.js";

import { ConfigurationLive } from "../../Configuration/Implementation/ConfigurationImplementation.js";

import { MountainConnectionError } from "../Error/MountainConnectionError.js";

import { MountainRPCError } from "../Error/MountainRPCError.js";

import { MountainSyncError } from "../Error/MountainSyncError.js";

import type {
	IDisposable,
	MountainService,
} from "../Interface/MountainService.js";

import type {
	MountainConnectionState,
	SyncResource,
	SyncResult,
} from "../Type/MountainType.js";

// ============================================================================
// Live Implementation
// ============================================================================

// All Wind IPC calls route through the single `MountainIPCInvoke` Tauri
// command. Mountain receives: method = channel name, params = flat array of
// args - the same shape TauriMainProcessService produces.
const Invoke = (
	Method: string,

	Params: ReadonlyArray<unknown>,
): Promise<unknown> =>
	TauriInvoke("MountainIPCInvoke", {
		method: Method,
		params: Params as unknown[],
	});

// Resolves after `Milliseconds`, or immediately when `Signal` aborts.
const Wait = (Milliseconds: number, Signal?: AbortSignal): Promise<void> =>
	new Promise((Resolve) => {
		const OnAbort = (): void => {
			clearTimeout(Timer);

			Resolve();
		};

		const Timer = setTimeout(() => {
			Signal?.removeEventListener("abort", OnAbort);

			Resolve();
		}, Milliseconds);

		Signal?.addEventListener("abort", OnAbort, { once: true });
	});

// Retry budget mirrors the former Schedule: exponential backoff from 100ms
// capped at 5s, at most 10 retries after the initial attempt.
const MaxConnectRetries = 10;

const InitialRetryDelayMilliseconds = 100;

const MaxRetryDelayMilliseconds = 5_000;

const SyncIntervalMilliseconds = 5_000;

/**
 * Creates the Mountain service.
 * Provides connection management with automatic retry and background
 * configuration sync while connected.
 */
export const CreateMountainService = (): MountainService => {

	let State: MountainConnectionState = { _tag: "Idle" };

	const StateListeners = new Set<(State: MountainConnectionState) => void>();

	const SyncListeners = new Set<(Resource: SyncResource) => void>();

	const ServiceAbort = new AbortController();

	let SyncAbort: AbortController | null = null;

	let SyncLoop: Promise<void> | null = null;

	let ConnectPromise: Promise<void> | null = null;

	const StopSyncLoop = (): void => {
		SyncAbort?.abort();

		SyncAbort = null;

		// Observe the stored loop promise so a rejection is never unhandled
		void SyncLoop?.catch(() => undefined);

		SyncLoop = null;
	};

	const StartSyncLoop = (): void => {
		StopSyncLoop();

		const Controller = new AbortController();

		SyncAbort = Controller;

		DevLog("mountain", "Starting background sync");

		SyncLoop = (async () => {
			while (
				!Controller.signal.aborted &&
				!ServiceAbort.signal.aborted
			) {
				try {
					await Sync("configuration");
				} catch (Failure) {
					DevLog(
						"mountain",

						"Background configuration sync failed:",

						Failure,
					);
				}

				await Wait(SyncIntervalMilliseconds, Controller.signal);
			}
		})();
	};

	const SetState = (Next: MountainConnectionState): void => {
		State = Next;

		DevLog("mountain", `Mountain state: ${Next._tag}`);

		for (const Listener of StateListeners) {
			try {
				Listener(Next);
			} catch (Failure) {
				DevLog("mountain", "Connection listener failed:", Failure);
			}
		}

		if (Next._tag === "Connected") {
			StartSyncLoop();
		} else if (Next._tag === "Disconnected" || Next._tag === "Error") {
			StopSyncLoop();
		}
	};

	const TryConnectOnce = async (): Promise<void> => {
		// `mountain_get_status` is a legacy snake_case channel that
		// predates the `prefix:method` convention. Registry relaxed
		// in wave 5 to allow both shapes; rename to
		// `mountain:getStatus` (coordinated Wind + Mountain change)
		// is the future clean-up path.
		let Result: { connected?: boolean; version?: string };

		try {
			Result = (await Invoke(Channel.MountainGetStatus, [])) as {
				connected?: boolean;

				version?: string;
			};
		} catch (Failure) {
			throw new MountainConnectionError(Failure);
		}

		if (!(Result.connected ?? false)) {
			throw new MountainConnectionError("Mountain not ready");
		}

		const Version = Result.version ?? "unknown";

		SetState({ _tag: "Connected", version: Version });

		DevLog("mountain", `Connected to Mountain v${Version}`);
	};

	const Connect = (): Promise<void> => {
		if (ConnectPromise) {
			return ConnectPromise;
		}

		ConnectPromise = (async () => {
			let Attempt = 1;

			SetState({ _tag: "Connecting", attempt: Attempt });

			for (;;) {
				try {
					await TryConnectOnce();

					return;
				} catch (Failure) {
					const Cause =
						Failure instanceof MountainConnectionError
							? Failure
							: new MountainConnectionError(Failure);

					if (
						Attempt > MaxConnectRetries ||
						ServiceAbort.signal.aborted
					) {
						SetState({ _tag: "Error", error: Cause });

						DevLog(
							"mountain",

							`Failed to connect: ${Cause.message}`,
						);

						throw Cause;
					}

					await Wait(
						Math.min(
							InitialRetryDelayMilliseconds * 2 ** (Attempt - 1),

							MaxRetryDelayMilliseconds,
						),

						ServiceAbort.signal,
					);

					Attempt += 1;

					SetState({ _tag: "Connecting", attempt: Attempt });
				}
			}
		})().finally(() => {
			ConnectPromise = null;
		});

		return ConnectPromise;
	};

	const Disconnect = (): void => {
		SetState({ _tag: "Disconnected", reason: "manual" });

		DevLog("mountain", "Disconnected from Mountain");
	};

	const RPC =
		<T>(Method: string) =>
		async (Args?: Record<string, unknown>): Promise<T> => {
			if (State._tag !== "Connected") {
				// Auto-connect if not connected
				await Connect();
			}

			try {
				return (await Invoke(Method, Args ? [Args] : [])) as T;
			} catch (Failure) {
				const Message =
					Failure instanceof Error
						? Failure.message
						: String(Failure);

				// Check if connection lost
				if (
					Message.includes("connection") ||
					Message.includes("network")
				) {
					SetState({
						_tag: "Disconnected",
						reason: "connection_lost",
					});
				}

				throw new MountainRPCError(Method, Failure);
			}
		};

	const EmitSyncEvent = (Resource: SyncResource): void => {
		for (const Listener of SyncListeners) {
			try {
				Listener(Resource);
			} catch (Failure) {
				DevLog("mountain", "Sync listener failed:", Failure);
			}
		}
	};

	const Sync = async (
		ResourceType: SyncResource["type"],
	): Promise<SyncResult> => {
		const StartTime = Date.now();

		DevLog("mountain", `Starting sync for ${ResourceType}`);

		try {
			switch (ResourceType) {
				case "configuration": {
					const MountainConfig = await RPC(
						"mountain_get_configuration",
					)();

					// Detect changes
					const MountainHash = JSON.stringify(MountainConfig);

					let LocalHash: string | null = null;

					try {
						LocalHash = JSON.stringify(ConfigurationLive.get());
					} catch {
						LocalHash = null;
					}

					if (MountainHash !== LocalHash) {
						const Validated =
							ConfigurationLive.validate(MountainConfig);

						ConfigurationLive.replace(Validated);

						ConfigurationLive.apply(Validated);

						EmitSyncEvent({
							type: "configuration",
							id: "main",
							data: MountainConfig,
							timestamp: Date.now(),
							hash: MountainHash,
						});
					}

					return {
						success: true,

						resourcesSynced: 1,

						errors: [],

						duration: Date.now() - StartTime,
					};
				}

				case "services": {
					const Services = await RPC<Record<string, unknown>>(
						"mountain_get_services_status",
					)();

					EmitSyncEvent({
						type: "services",
						id: "all",
						data: Services,
						timestamp: Date.now(),
						hash: JSON.stringify(Services),
					});

					return {
						success: true,

						resourcesSynced: Object.keys(Services).length,

						errors: [],

						duration: Date.now() - StartTime,
					};
				}

				case "state": {
					const StateData = await RPC("mountain_get_state")();

					EmitSyncEvent({
						type: "state",
						id: "main",
						data: StateData,
						timestamp: Date.now(),
						hash: JSON.stringify(StateData),
					});

					return {
						success: true,

						resourcesSynced: 1,

						errors: [],

						duration: Date.now() - StartTime,
					};
				}

				default:
					return {
						success: false,

						resourcesSynced: 0,

						errors: [`Unknown resource type: ${ResourceType}`],

						duration: Date.now() - StartTime,
					};
			}
		} catch (Failure) {
			throw new MountainSyncError(ResourceType, Failure);
		}
	};

	const Version = async (): Promise<string> => {
		try {
			const Status = (await Invoke(Channel.MountainGetStatus, [])) as {
				version?: string;
			};

			return Status.version ?? "unknown";
		} catch (Failure) {
			throw new MountainConnectionError(Failure);
		}
	};

	const HealthCheck = async (): Promise<boolean> => {
		try {
			const Status = await RPC<{ connected?: boolean }>(
				Channel.MountainGetStatus,
			)();

			return Status.connected === true;
		} catch {
			return false;
		}
	};

	const OnConnectionChange = (
		Listener: (State: MountainConnectionState) => void,
	): IDisposable => {
		StateListeners.add(Listener);

		return {
			dispose: () => {
				StateListeners.delete(Listener);
			},
		};
	};

	const OnSyncEvent = (
		Listener: (Resource: SyncResource) => void,
	): IDisposable => {
		SyncListeners.add(Listener);

		return {
			dispose: () => {
				SyncListeners.delete(Listener);
			},
		};
	};

	const Dispose = (): void => {
		ServiceAbort.abort();

		StopSyncLoop();

		StateListeners.clear();

		SyncListeners.clear();
	};

	return {
		connectionState: () => State,

		onConnectionChange: OnConnectionChange,

		connect: Connect,

		disconnect: Disconnect,

		rpc: RPC,

		sync: Sync,

		onSyncEvent: OnSyncEvent,

		version: Version,

		healthCheck: HealthCheck,

		dispose: Dispose,
	} satisfies MountainService;
};

/**
 * Live Mountain service singleton.
 */
export const MountainLive: MountainService = CreateMountainService();

export default MountainLive;
