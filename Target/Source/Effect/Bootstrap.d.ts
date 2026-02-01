/**
 * @module Effect/Bootstrap
 * @description
 * Bootstrap orchestration using Effect-TS.
 * Replaces legacy BootstrapOrchestrator with Effect-based stage sequencing.
 *
 * This module coordinates all initialization stages:
 * - Stage 0: Environment detection (via Environment service)
 * - Stage 1: Preload readiness (via Sandbox service)
 * - Stage 2: Configuration loading (via Configuration service)
 * - Stage 3: Service initialization (via Service layer)
 * - Stage 4: Preparation (resource loading)
 * - Stage 5: Initialization (VSCode workbench startup)
 * - Stage 6: Health checks (via Health service)
 */
import { Effect } from "effect";
export interface BootstrapOptions {
    readonly debugMode?: boolean;
    readonly verboseLogging?: boolean;
    readonly pauseBetweenStages?: boolean;
    readonly enablePerformanceTracking?: boolean;
    readonly skipHealthCheck?: boolean;
}
export interface StageResult {
    readonly stageName: string;
    readonly success: boolean;
    readonly duration: number;
    readonly error?: Error;
}
export interface BootstrapResult {
    readonly success: boolean;
    readonly totalDuration: number;
    readonly stages: ReadonlyArray<StageResult>;
    readonly error?: Error;
}
export interface BootstrapService {
    readonly run: (options?: BootstrapOptions) => Effect.Effect<BootstrapResult>;
}
export declare const BootstrapTag: any;
export declare const BootstrapLive: any;
export declare const makeMockBootstrap: () => BootstrapService;
export declare const BootstrapMock: any;
export declare const runBootstrap: (options?: BootstrapOptions) => Effect.Effect<any, any, any>;
//# sourceMappingURL=Bootstrap.d.ts.map