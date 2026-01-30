/**
 * @module Stage0-Environment
 * @description
 * Stage 0: Environment Detection
 * Detects the runtime environment (Tauri/Browser), mode (Development/Production),
 * and validates the runtime environment.
 */
import type { StageResult, EnvironmentData } from './Types.js';
export declare class EnvironmentStage {
    static readonly STAGE_NAME: "Environment";
    /**
     * Execute the environment detection stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Detect the platform (Tauri or Browser)
     */
    private static detectPlatform;
    /**
     * Detect the mode (Development or Production)
     */
    private static detectMode;
    /**
     * Validate the runtime environment
     */
    private static validateRuntime;
    /**
     * Set global flags for the bootstrap process
     */
    private static setGlobalFlags;
    /**
     * Get environment data from window globals
     */
    static getEnvironmentData(): EnvironmentData | null;
}
//# sourceMappingURL=Stage0-Environment.d.ts.map