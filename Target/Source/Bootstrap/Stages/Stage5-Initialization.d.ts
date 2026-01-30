/**
 * @module Bootstrap/Stages/Stage5-Initialization
 * @description
 * Stage 5: Workbench Initialization
 * Creates and initializes the VSCode workbench instance.
 * This is the critical integration point with VSCode's workbench system.
 */
import type { StageResult, WorkbenchData } from '../Types/Types.js';
export declare class InitializationStage {
    static readonly STAGE_NAME: "Initialization";
    /**
     * Execute the workbench initialization stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Validate preconditions for workbench initialization
     */
    private static validatePreconditions;
    /**
     * Create VSCode workbench options
     */
    private static createWorkbenchOptions;
    /**
     * ADVANCED WORKBENCH CREATION: Multi-strategy approach with intelligent fallbacks
     */
    private static createWorkbench;
    /**
     * Strategy 1: Create VSCode workbench using official factory
     */
    private static createVSCodeWorkbench;
    /**
     * Strategy 2: Create Tauri-specific workbench
     */
    private static createTauriWorkbench;
    /**
     * Strategy 3: Create browser-specific workbench
     */
    private static createBrowserWorkbench;
    /**
     * Strategy 4: Create minimal workbench implementation
     */
    private static createMinimalWorkbench;
    /**
     * Validate workbench options
     */
    private static validateWorkbenchOptions;
    /**
     * ADVANCED FALLBACK WORKBENCH: Sophisticated minimal implementation
     */
    private static createFallbackWorkbench;
    /**
     * Initialize fallback services
     */
    private static initializeFallbackServices;
    /**
     * ADVANCED SERVICE INITIALIZATION: Multi-phase service loading
     */
    private static initializeWorkbenchServices;
    /**
     * Advanced manual service initialization
     */
    private static initializeServicesAdvanced;
    /**
     * Create minimal service collection
     */
    private static createMinimalServiceCollection;
    /**
     * Register critical service
     */
    private static registerCriticalService;
    /**
     * Create minimal service implementation
     */
    private static createMinimalService;
    /**
     * Create emergency service implementation
     */
    private static createEmergencyService;
    /**
     * Validate service health
     */
    private static validateServiceHealth;
    /**
     * Restart unhealthy services
     */
    private static restartUnhealthyServices;
    /**
     * Restart individual service
     */
    private static restartService;
    /**
     * Advanced fallback service initialization
     */
    private static initializeFallbackServicesAdvanced;
    /**
     * Create emergency service collection
     */
    private static createEmergencyServiceCollection;
    /**
     * Start the workbench
     */
    private static startWorkbench;
    /**
     * Validate workbench state
     */
    private static validateWorkbenchState;
    /**
     * Get workbench instance from globals
     */
    static getWorkbenchInstance(): any;
    /**
     * Check if workbench is running
     */
    static isWorkbenchRunning(): boolean;
    /**
     * Get workbench status
     */
    static getWorkbenchStatus(): WorkbenchData;
}
//# sourceMappingURL=Stage5-Initialization.d.ts.map