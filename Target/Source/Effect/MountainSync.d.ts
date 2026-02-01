/**
 * @module Effect/MountainSync
 * @description
 * Mountain-Wind synchronization service using Effect-TS.
 * Replaces class-based MountainWindSync with Effect-based reactive sync.
 */
import { Effect, Layer } from "effect";
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
    readonly syncNow: () => Effect.Effect<SyncResult>;
    readonly getStatus: () => Effect.Effect<SyncStatus>;
    readonly getStats: () => Effect.Effect<SyncStats>;
    readonly pause: () => Effect.Effect<void>;
    readonly resume: () => Effect.Effect<void>;
}
export interface SyncResult {
    readonly success: boolean;
    readonly itemsSynced: number;
    readonly duration: number;
    readonly error?: Error;
}
export declare const MountainSyncTag: any;
export declare const MountainSyncLive: Layer.Layer<unknown, unknown, unknown>;
export declare const makeMockMountainSync: () => MountainSyncService;
export declare const MountainSyncMock: Layer.Layer<unknown, never, never>;
//# sourceMappingURL=MountainSync.d.ts.map