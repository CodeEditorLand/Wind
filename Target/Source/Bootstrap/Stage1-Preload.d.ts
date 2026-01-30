/**
 * @module Stage1-Preload
 * @description
 * Stage 1: Preload Initialization
 * Validates that the Wind preload script has loaded and window.vscode is available.
 */
import type { StageResult } from './Types.js';
export declare class PreloadStage {
    static readonly STAGE_NAME: "Preload";
    private static readonly PRELOAD_TIMEOUT;
    /**
     * Execute the preload validation stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Wait for window.vscode to be available
     */
    private static waitForPreload;
    /**
     * Validate that all required API shims are present
     */
    private static validateAPIShims;
    /**
     * Test IPC communication
     */
    private static testIPCCommunication;
}
//# sourceMappingURL=Stage1-Preload.d.ts.map