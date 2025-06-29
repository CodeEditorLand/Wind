/**
 * @module Service (Integration/Tauri)
 * @description Defines the service that provides a low-level bridge to the
 * native Tauri host. This is a placeholder service definition.
 *
 * Responsibilities:
 *   - Wrap raw Tauri `invoke`, `listen`, and `emit` calls in declarative Effects.
 *   - Act as the sole entry point for all native backend communication.
 */

import type { Event as TauriEvent } from "@tauri-apps/api/event";
import { Effect } from "effect";

/**
 * The interface for the Tauri Integration service. It provides an Effect-native
 * API for interacting with the Tauri backend.
 */
export interface Integration {
	readonly Invoke: <T>(
		Command: string,
		Arguments?: object,
	) => Effect.Effect<T, Error>;
	readonly Listen: <T>(
		EventName: string,
		Handler: (Event: TauriEvent<T>) => void,
	) => Effect.Effect<() => void, Error>;
	readonly Emit: (
		EventName: string,
		Payload?: object,
	) => Effect.Effect<void, Error>;
}

/**
 * The `Effect.Service` for the Tauri Integration service.
 * A live implementation would wrap the `@tauri-apps/api` functions. This
 * placeholder allows dependent services to be implemented correctly.
 */
export class IntegrationService extends Effect.Service<Integration>()(
	"Integration/Tauri",
	{
		// This is a placeholder implementation. The real implementation will be
		// built out later and will wrap the actual Tauri APIs.
		sync: () => ({
			Invoke: <T>(
				Command: string,
				_Arguments?: object,
			): Effect.Effect<T, Error> =>
				Effect.dieMessage(
					`IntegrationService.Invoke not implemented for command: ${Command}`,
				),
			Listen: <T>(
				_EventName: string,
				_Handler: (Event: TauriEvent<T>) => void,
			): Effect.Effect<() => void, Error> =>
				Effect.dieMessage(`IntegrationService.Listen not implemented`),
			Emit: (_EventName: string, _Payload?: object) =>
				Effect.dieMessage(`IntegrationService.Emit not implemented`),
		}),
	},
) {}
