/**
 * @module Bootstrap/Stages/Stage6-HealthCheck
 * @description
 * Stage 6: Health Check
 * Verifies that the VSCode workbench is running correctly and tests core functionality.
 */
import type { StageResult } from "../Types/Types.js";
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
     * Test VSCode API accessibility
     */
    private static testVSCodeAPI;
    /**
     * Test service access
     */
    private static testServiceAccess;
    /**
     * Test configuration access
     */
    private static testConfigurationAccess;
    /**
     * Test editor functionality
     */
    private static testEditorFunctionality;
    /**
     * Check for errors
     */
    private static checkForErrors;
    /**
     * Generate health report
     */
    private static generateHealthReport;
    /**
     * Get health status
     */
    static getHealthStatus(): {
        workbenchRunning: boolean;
        servicesAccessible: boolean;
        configurationValid: boolean;
        errorsPresent: boolean;
        overallHealth: string;
    };
    /**
     * Export health data
     */
    static exportHealthData(): string;
}
//# sourceMappingURL=Stage6-HealthCheck.d.ts.map