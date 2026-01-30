/**
 * @module Stage6-HealthCheck
 * @description
 * Stage 6: Health Check
 * Verifies that the workbench is running and core functionality works.
 */
import type { StageResult } from './Types.js';
export declare class HealthCheckStage {
    static readonly STAGE_NAME: "HealthCheck";
    /**
     * Execute the health check stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Verify workbench is running
     */
    private static verifyWorkbenchRunning;
    /**
     * Test core functionality
     */
    private static testCoreFunctionality;
    /**
     * Test window.vscode
     */
    private static testWindowVscode;
    /**
     * Test configuration
     */
    private static testConfiguration;
    /**
     * Test IPC
     */
    private static testIPC;
    /**
     * Test services
     */
    private static testServices;
    /**
     * Check for errors
     */
    private static checkForErrors;
    /**
     * Collect health metrics
     */
    private static collectHealthMetrics;
    /**
     * Get memory usage
     */
    private static getMemoryUsage;
}
//# sourceMappingURL=Stage6-HealthCheck.d.ts.map