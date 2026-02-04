/**
 * @module Effect/MountainSync
 * @description
 * Mountain-Wind synchronization service using Effect-TS.
 * Replaces class-based MountainWindSync with Effect-based reactive sync.
 */
import { Context, Effect, Layer } from "effect";
import { MountainTag } from "./Mountain.js";
import { IPCTag } from "./IPC.js";
import { TelemetryTag } from "./Telemetry.js";
export type SyncStatus = "idle" | "syncing" | "paused" | "error";
export interface SyncConfig {
    readonly enabled: boolean;
    readonly syncIntervalMs: number;
    readonly autoRetry: boolean;
    readonly maxRetries: number;
    readonly batchSize: number;
}
export interface SyncStats {
    readonly lastSyncTime: number;
    readonly syncCount: number;
    readonly successCount: number;
    readonly errorCount: number;
    readonly itemsSynced: number;
}
export interface MountainSyncService {
    readonly start: (config?: Partial<SyncConfig>) => Effect.Effect<void>;
    readonly stop: () => Effect.Effect<void>;
    readonly syncNow: () => Effect.Effect<MountainSyncResult>;
    readonly getStatus: () => Effect.Effect<SyncStatus>;
    readonly getStats: () => Effect.Effect<SyncStats>;
    readonly pause: () => Effect.Effect<void>;
    readonly resume: () => Effect.Effect<void>;
}
export interface MountainSyncResult {
    readonly success: boolean;
    readonly itemsSynced: number;
    readonly duration: number;
    readonly error?: Error;
}
declare const MountainSyncTag_base: Context.TagClass<MountainSyncTag, "Effect/MountainSyncService", MountainSyncService>;
export declare class MountainSyncTag extends MountainSyncTag_base {
}
export declare const MountainSyncLive: Layer.Layer<MountainSyncTag, never, TelemetryTag | IPCTag | MountainTag>;
export declare const makeMockMountainSync: () => MountainSyncService;
export declare const MountainSyncMock: Layer.Layer<MountainSyncTag, never, never>;
export {};
//# sourceMappingURL=MountainSync.d.ts.map