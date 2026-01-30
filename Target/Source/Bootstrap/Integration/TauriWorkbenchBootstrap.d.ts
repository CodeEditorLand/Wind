/**
 * @module TauriWorkbenchBootstrap
 * @description
 * Tauri-specific workbench bootstrap sequence for VSCode integration.
 * Replaces Electron's bootstrap process with Tauri-compatible workflow.
 *
 * Architecture:
 * - Initializes Tauri-specific services
 * - Creates workbench environment for Tauri
 * - Integrates with Wind service infrastructure
 * - Provides seamless VSCode workbench experience
 *
 * Features:
 * - Comprehensive workbench initialization sequence
 * - Advanced error handling and recovery
 * - Performance monitoring and telemetry
 * - Configuration validation and optimization
 */
/**
 * Tauri workbench bootstrap configuration
 */
export interface ITauriWorkbenchConfig {
    enableDebugMode: boolean;
    enablePerformanceTracking: boolean;
    showStatusUI: boolean;
    enableServiceLogging: boolean;
    workbenchOptions: any;
}
/**
 * Tauri workbench bootstrap result
 */
export interface ITauriWorkbenchResult {
    success: boolean;
    workbench: any;
    services: Map<string, any>;
    bootstrapDuration: number;
    error?: Error;
}
/**
 * Tauri workbench bootstrap implementation
 */
export declare class TauriWorkbenchBootstrap {
    private orchestrator;
    private config;
    private workbenchInstance;
    constructor(config?: Partial<ITauriWorkbenchConfig>);
    /**
     * Main bootstrap entry point
     */
    bootstrap(): Promise<ITauriWorkbenchResult>;
    /**
     * Initialize service mappings
     */
    private initializeServiceMappings;
    /**
     * Bootstrap core infrastructure
     */
    private bootstrapCoreInfrastructure;
    /**
     * Create workbench environment
     */
    private createWorkbenchEnvironment;
    /**
     * Initialize workbench services
     */
    private initializeWorkbenchServices;
    /**
     * Finalize bootstrap
     */
    private finalizeBootstrap;
    /**
     * Perform final checks
     */
    private performFinalChecks;
    /**
     * Get initialized services
     */
    private getInitializedServices;
    /**
     * Get workbench instance
     */
    getWorkbench(): any;
    /**
     * Get service by name
     */
    getService<T>(serviceName: string): T | undefined;
    /**
     * Dispose workbench and services
     */
    dispose(): void;
}
export declare const tauriWorkbenchBootstrap: TauriWorkbenchBootstrap;
//# sourceMappingURL=TauriWorkbenchBootstrap.d.ts.map