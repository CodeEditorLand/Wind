/**
 * @module Bootstrap/Stages/Stage0-Environment
 * @description
 * Stage 0: Environment Detection
 * Detects platform, mode, and validates runtime environment.
 */
import type { StageResult, Platform, Mode } from '../Types/Types.js';
export declare class EnvironmentStage {
    static readonly STAGE_NAME: "Environment";
    /**
     * Execute the environment detection stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Detect platform (Tauri/Browser)
     */
    private static detectPlatform;
    /**
     * Detect mode (Development/Production)
     */
    private static detectMode;
    /**
     * Validate runtime environment
     */
    private static validateRuntimeEnvironment;
    /**
     * Validate Tauri environment
     */
    private static validateTauriEnvironment;
    /**
     * Validate browser environment
     */
    private static validateBrowserEnvironment;
    /**
     * Gather environment data
     */
    private static gatherEnvironmentData;
    /**
     * Set up global flags
     */
    private static setupGlobalFlags;
    /**
     * Get platform from globals
     */
    static getPlatform(): Platform;
    /**
     * Get mode from globals
     */
    static getMode(): Mode;
    /**
     * Check if debug mode is enabled
     */
    static isDebugMode(): boolean;
}
//# sourceMappingURL=Stage0-Environment.d.ts.map