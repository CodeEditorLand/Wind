/**
 * @module Service (Integration/Tauri)
 * @description Defines the service that provides a low-level bridge to the
 * native Tauri host. This is a placeholder service definition.
 *
 * Responsibilities:
 *   - Wrap raw Tauri `invoke`, `listen`, and `emit` calls in declarative Effects.
 *   - Act as the sole entry point for all native backend communication.
 */
import { Effect } from "effect";
import type { Event as TauriEvent } from "@tauri-apps/api/event";
/**
 * The interface for the Tauri Integration service. It provides an Effect-native
 * API for interacting with the Tauri backend.
 */
export interface Integration {
    readonly Invoke: <T>(Command: string, Arguments?: object) => Effect.Effect<T, Error>;
    readonly Listen: <T>(EventName: string, Handler: (Event: TauriEvent<T>) => void) => Effect.Effect<() => void, Error>;
    readonly Emit: (EventName: string, Payload?: object) => Effect.Effect<void, Error>;
}
declare const IntegrationService_base: Effect.Service.Class<IntegrationService, "Integration/Tauri", {
    readonly sync: () => {
        Invoke: (Command: string, _Arguments?: object) => Effect.Effect<never, never, never>;
        Listen: (_EventName: string, _Handler: any) => Effect.Effect<never, never, never>;
        Emit: (_EventName: string, _Payload?: object) => Effect.Effect<never, never, never>;
    };
}>;
/**
 * The `Effect.Service` for the Tauri Integration service.
 * A live implementation would wrap the `@tauri-apps/api` functions. This
 * placeholder allows dependent services to be implemented correctly.
 */
export declare class IntegrationService extends IntegrationService_base {
}
export {};
