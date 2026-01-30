/**
 * @module Bootstrap/Stages/Stage1-Preload
 * @description
 * Stage 1: Preload Initialization
 * Loads Wind preload script and validates window.vscode API shims.
 */
import type { StageResult } from '../Types/Types.js';
export declare class PreloadStage {
    static readonly STAGE_NAME: "Preload";
    /**
     * Execute the preload initialization stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Wait for preload script to be ready
     */
    private static waitForPreloadReady;
    /**
     * Check if preload script is ready
     */
    private static isPreloadReady;
    /**
     * Validate window.vscode API
     */
    private static validateVSCodeAPI;
    /**
     * Verify API shims are present
     */
    private static verifyAPIShims;
    /**
     * Test IPC communication
     */
    private static testIPCCommunication;
    /**
     * Get preload status
     */
    static getPreloadStatus(): {
        ready: boolean;
        vscodeAvailable: boolean;
        contextAvailable: boolean;
        ipcAvailable: boolean;
    };
}
//# sourceMappingURL=Stage1-Preload.d.ts.map