/**
 * @module Stage4-Preparation
 * @description
 * Stage 4: Workbench Preparation
 * Waits for DOM ready, validates DOM structure, sets up global variables,
 * and loads worker scripts.
 */
import type { StageResult } from './Types.js';
export declare class PreparationStage {
    static readonly STAGE_NAME: "Preparation";
    /**
     * Execute the workbench preparation stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Wait for DOM to be ready
     */
    private static waitForDOMReady;
    /**
     * Validate DOM structure
     */
    private static validateDOMStructure;
    /**
     * Set up global variables
     */
    private static setupGlobalVariables;
    /**
     * Load worker scripts
     */
    private static loadWorkerScripts;
    /**
     * Load NLS messages
     */
    private static loadNLSMessages;
}
//# sourceMappingURL=Stage4-Preparation.d.ts.map