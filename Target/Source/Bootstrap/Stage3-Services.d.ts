/**
 * @module Stage3-Services
 * @description
 * Stage 3: Service Layer Setup
 * Initializes Effect-TS runtime and registers core services.
 */
import type { StageResult } from './Types.js';
export declare class ServicesStage {
    static readonly STAGE_NAME: "Services";
    /**
     * Execute the service layer setup stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Initialize Effect-TS runtime
     */
    private static initializeEffectRuntime;
    /**
     * Create minimal runtime fallback
     */
    private static createMinimalRuntime;
    /**
     * Register core services
     */
    private static registerCoreServices;
    /**
     * Register a single service
     */
    private static registerService;
    /**
     * Validate service dependencies
     */
    private static validateServiceDependencies;
    /**
     * Create service collection
     */
    private static createServiceCollection;
    /**
     * Create minimal service collection fallback
     */
    private static createMinimalServiceCollection;
    /**
     * Store service globals
     */
    private static storeServiceGlobals;
    /**
     * Get service collection from globals
     */
    static getServiceCollection(): any;
    /**
     * Get Effect runtime from globals
     */
    static getEffectRuntime(): any;
}
//# sourceMappingURL=Stage3-Services.d.ts.map