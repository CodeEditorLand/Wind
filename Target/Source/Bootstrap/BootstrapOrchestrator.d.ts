/**
 * @module BootstrapOrchestrator
 * @description
 * Main orchestrator for the atomic bootstrap system.
 * Coordinates all bootstrap stages and manages the overall process.
 */
import type { BootstrapConfig, BootstrapResult, StageResult } from "./Types.js";
export declare class BootstrapOrchestrator {
    private static instance;
    private config;
    private stages;
    private mountainIntegrationService;
    private constructor();
    /**
     * Initialize the orchestrator with configuration
     */
    static initialize(config: BootstrapConfig): BootstrapOrchestrator;
    /**
     * Get the orchestrator instance
     */
    static getInstance(): BootstrapOrchestrator;
    /**
     * Initialize all bootstrap stages with advanced Mountain integration
     */
    private initializeStages;
    /**
     * Advanced Mountain integration stage
     */
    private executeMountainIntegration;
    /**
     * Execute the entire bootstrap process
     */
    execute(): Promise<BootstrapResult>;
    /**
     * Calculate progress percentage
     */
    private calculateProgress;
    /**
     * Pause between stages
     */
    private pauseBetweenStages;
    /**
     * Log summary of bootstrap process
     */
    private logSummary;
    /**
     * Get bootstrap results
     */
    getResults(): StageResult[];
    /**
     * Export diagnostic data
     */
    exportDiagnostics(): string;
    /**
     * Clean up resources
     */
    cleanup(): void;
}
/**
 * Main entry point for the bootstrap process
 */
export declare function bootstrap(config?: Partial<BootstrapConfig>): Promise<BootstrapResult>;
//# sourceMappingURL=BootstrapOrchestrator.d.ts.map