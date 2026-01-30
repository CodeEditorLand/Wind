/**
 * @module Stage5-Initialization
 * @description
 * Stage 5: Workbench Initialization
 * Creates and starts the VSCode workbench instance.
 */
import type { StageResult } from './Types.js';
export declare class InitializationStage {
    static readonly STAGE_NAME: "Initialization";
    /**
     * Execute the workbench initialization stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Get configuration from window.vscode.context
     */
    private static getConfiguration;
    /**
     * Get service collection
     */
    private static getServiceCollection;
    /**
     * Create minimal service collection
     */
    private static createMinimalServiceCollection;
    /**
     * Create workbench instance
     */
    private static createWorkbench;
    /**
     * Start workbench
     */
    private static startWorkbench;
    /**
     * Validate workbench state
     */
    private static validateWorkbenchState;
}
//# sourceMappingURL=Stage5-Initialization.d.ts.map