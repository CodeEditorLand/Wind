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
import { Effect, Layer, Context } from "effect";
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
    readonly error: Error | undefined;
}
export interface BootstrapResult {
    readonly success: boolean;
    readonly totalDuration: number;
    readonly stages: ReadonlyArray<StageResult>;
    readonly error: Error | undefined;
}
export interface BootstrapService {
    readonly run: (options?: BootstrapOptions) => any;
}
declare const BootstrapTag_base: Context.TagClass<BootstrapTag, "Effect/BootstrapService", BootstrapService>;
export declare class BootstrapTag extends BootstrapTag_base {
}
export declare const BootstrapLive: Layer.Layer<BootstrapTag, never, never>;
export declare const makeMockBootstrap: () => BootstrapService;
export declare const BootstrapMock: Layer.Layer<BootstrapTag, never, never>;
export declare const runBootstrap: (options?: BootstrapOptions) => Effect.Effect<any, unknown, unknown>;
export {};
//# sourceMappingURL=Bootstrap.d.ts.map