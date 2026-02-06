/**
 * @module Effect/Mountain
 * @description
 * Atomic Mountain backend service using Effect-TS.
 * Consolidates MountainIntegrationService and MountainWindSync into a single,
 * unified backend integration layer with proper error handling and resilience.
 */
import { Context, Effect, Layer, Stream } from "effect";
export declare class MountainConnectionError extends Error {
    readonly _tag = "MountainConnectionError";
    readonly cause: unknown;
    constructor(cause: unknown);
}
export declare class MountainRPCError extends Error {
    readonly _tag = "MountainRPCError";
    readonly method: string;
    readonly cause: unknown;
    constructor(method: string, cause: unknown);
}
export declare class MountainSyncError extends Error {
    readonly _tag = "MountainSyncError";
    readonly resource: string;
    readonly cause: unknown;
    constructor(resource: string, cause: unknown);
}
export declare class MountainStateError extends Error {
    readonly _tag = "MountainStateError";
    readonly expected: string;
    readonly actual: string;
    constructor(expected: string, actual: string);
}
export type MountainConnectionState = {
    readonly _tag: "Idle";
} | {
    readonly _tag: "Connecting";
    readonly attempt: number;
} | {
    readonly _tag: "Connected";
    readonly version: string;
} | {
    readonly _tag: "Disconnected";
    readonly reason: string;
} | {
    readonly _tag: "Error";
    readonly error: Error;
};
export interface SyncResource {
    readonly type: "configuration" | "services" | "state" | "files";
    readonly id: string;
    readonly data: unknown;
    readonly timestamp: number;
    readonly hash: string;
}
export interface SyncResult {
    readonly success: boolean;
    readonly resourcesSynced: number;
    readonly errors: ReadonlyArray<string>;
    readonly duration: number;
}
export interface MountainService {
    /** Current connection state */
    readonly connectionState: Effect.Effect<MountainConnectionState, never>;
    /** Stream of connection state changes */
    readonly connectionChanges: Stream.Stream<MountainConnectionState, never>;
    /** Connect to Mountain backend */
    readonly connect: Effect.Effect<void, MountainConnectionError>;
    /** Disconnect from Mountain backend */
    readonly disconnect: Effect.Effect<void, never>;
    /** Execute RPC method */
    readonly rpc: <T>(method: string) => (args?: Record<string, unknown>) => Effect.Effect<T, MountainRPCError>;
    /** Sync a specific resource type */
    readonly sync: (resourceType: SyncResource["type"]) => Effect.Effect<SyncResult, MountainSyncError>;
    /** Stream of all sync events */
    readonly syncEvents: Stream.Stream<SyncResource, never>;
    /** Get Mountain version */
    readonly version: Effect.Effect<string, MountainConnectionError>;
    /** Health check */
    readonly healthCheck: Effect.Effect<boolean, MountainConnectionError>;
}
declare const MountainTag_base: Context.TagClass<MountainTag, "Mountain", MountainService>;
export declare class MountainTag extends MountainTag_base {
}
export declare const Mountain: typeof MountainTag;
export declare const MountainLive: Layer.Layer<MountainTag, never, import("./Telemetry.js").TelemetryTag | import("./IPC.js").IPCTag | import("./Configuration.js").ConfigurationTag>;
export declare const MountainMockLive: Layer.Layer<MountainTag, never, never>;
export {};
//# sourceMappingURL=Mountain.d.ts.map