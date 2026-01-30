/**
 * @module Bootstrap/Stages/Stage3-Services
 * @description
 * Stage 3: Service Layer Setup
 * Initializes Effect-TS runtime and registers core services with VSCode integration.
 *
 * Uses the new Integration/Core/CoreServices.ts which provides Effect-TS based service layers.
 * Services are registered via ServiceAdapter for VSCode compatibility.
 */
import type { StageResult } from '../Types/Types.js';
import { ServiceAdapter } from '../Integration/ServiceAdapter.js';
export declare class ServicesStage {
    static readonly STAGE_NAME: "Services";
    /**
     * Execute the service layer setup stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Initialize Effect-TS runtime with defensive fallbacks
     */
    private static initializeEffectRuntime;
    /**
     * Create minimal runtime fallback
     */
    private static createMinimalRuntime;
    /**
     * Initialize service adapter
     */
    private static initializeServiceAdapter;
    /**
     * Create VSCode service collection
     */
    private static createVSCodeServiceCollection;
    /**
     * Register core services using new CoreServices layer
     * Implements TDD-compliant registration with individual layer creation
     */
    private static registerCoreServices;
    /**
     * DEPRECATED: Individual registration now handled in registerCoreServices
     * Kept for backward compatibility
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
    /**
     * Get service adapter from globals
     */
    static getServiceAdapter(): ServiceAdapter | null;
}
//# sourceMappingURL=Stage3-Services.d.ts.map