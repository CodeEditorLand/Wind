/**
 * @module Bootstrap/Stages/Stage4-Preparation
 * @description
 * Stage 4: Workbench Preparation
 * Prepares the DOM and environment for VSCode workbench initialization.
 */
import type { StageResult } from "../Types/Types.js";
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
     * Create workbench container if missing
     */
    private static createWorkbenchContainer;
    /**
     * Set up global variables for VSCode
     */
    private static setupGlobalVariables;
    /**
     * Load worker scripts
     */
    private static loadWorkerScripts;
    /**
     * Load a script dynamically
     */
    private static loadScript;
    /**
     * Prepare VSCode configuration
     */
    private static prepareVSCodeConfiguration;
    /**
     * Create configuration meta tag for VSCode
     */
    private static createConfigurationMetaTag;
    /**
     * Set up NLS (National Language Support)
     */
    private static setupNLS;
    /**
     * Get preparation status
     */
    static getPreparationStatus(): {
        domReady: boolean;
        workersLoaded: boolean;
        configurationReady: boolean;
        vscodeGlobalsSet: boolean;
    };
}
//# sourceMappingURL=Stage4-Preparation.d.ts.map