/**
 * @module Bootstrap/Integration/ServiceAdapter
 * @description
 * ADVANCED SERVICE ADAPTER: Transparent bridge between Wind Effect-TS services and VSCode's ServiceCollection.
 * This implementation provides advanced proxy patterns, lazy loading, dependency resolution, and error recovery.
 * Enables seamless integration with VSCode workbench while maintaining Wind's architectural patterns.
 */
import type { IVSCodeServiceCollection, IVSCodeServiceIdentifier } from "../Types/VSCodeTypes.js";
interface ServiceAdapterConfig {
    enableLazyLoading: boolean;
    enableProxyPatterns: boolean;
    enableDependencyTracking: boolean;
    enableErrorRecovery: boolean;
    maxRetryAttempts: number;
}
interface ServiceDependency {
    serviceId: string;
    required: boolean;
    fallback?: () => any;
}
export declare class ServiceAdapter {
    private static instance;
    private serviceCollection;
    private effectRuntime;
    private adapters;
    private config;
    private dependencyGraph;
    private serviceHealth;
    private constructor();
    /**
     * Get the singleton instance
     */
    static getInstance(): ServiceAdapter;
    /**
     * Advanced initialization with configuration options
     */
    initialize(serviceCollection: IVSCodeServiceCollection, effectRuntime: any, config?: Partial<ServiceAdapterConfig>): void;
    /**
     * Initialize dependency graph for service resolution
     */
    private initializeDependencyGraph;
    /**
     * ADVANCED SERVICE REGISTRATION: Lazy loading, dependency resolution, error recovery
     */
    registerService<T>(serviceId: IVSCodeServiceIdentifier<T>, windService: any, adapter?: (windService: any) => T, options?: {
        lazy?: boolean;
        dependencies?: ServiceDependency[];
        fallback?: () => T;
    }): Promise<boolean>;
    /**
     * Register service with retry logic
     */
    private registerServiceWithRetry;
    /**
     * Register fallback service
     */
    private registerFallbackService;
    /**
     * Validate service dependencies
     */
    private validateDependencies;
    /**
     * Create advanced proxy adapter with error handling and monitoring
     */
    private createAdvancedProxyAdapter;
    /**
     * Handle service errors with recovery strategies
     */
    private handleServiceError;
    /**
     * Register lazy service
     */
    private registerLazyService;
    /**
     * Create default adapter for a service
     */
    private createDefaultAdapter;
    /**
     * ADVANCED ENVIRONMENT SERVICE ADAPTER: Comprehensive VSCode environment integration
     */
    private createEnvironmentServiceAdapter;
    /**
     * ADVANCED CONFIGURATION SERVICE ADAPTER: Event-driven configuration management
     */
    private createConfigurationServiceAdapter;
    /**
     * ADVANCED LOGGER SERVICE ADAPTER: Multi-level logging with performance monitoring
     */
    private createLoggerServiceAdapter;
    /**
     * Create instantiation service adapter
     */
    private createInstantiationServiceAdapter;
    /**
     * Create file service adapter
     */
    private createFileServiceAdapter;
    /**
     * Create notification service adapter
     */
    private createNotificationServiceAdapter;
    /**
     * Create dialog service adapter
     */
    private createDialogServiceAdapter;
    /**
     * ADVANCED UTILITY METHODS: Service health monitoring and diagnostics
     */
    /**
     * Get service adapter by ID with health checking
     */
    getAdapter<T>(serviceId: IVSCodeServiceIdentifier<T>): T | undefined;
    /**
     * Check if service is registered with health status
     */
    hasService<T>(serviceId: IVSCodeServiceIdentifier<T>): boolean;
    /**
     * Get all registered services with health status
     */
    getRegisteredServices(): Array<{
        name: string;
        healthy: boolean;
    }>;
    /**
     * Get service collection with validation
     */
    getServiceCollection(): IVSCodeServiceCollection | null;
    /**
     * Get Effect runtime with validation
     */
    getEffectRuntime(): any | null;
    /**
     * Get service health status
     */
    getServiceHealth(serviceId: IVSCodeServiceIdentifier<any>): boolean;
    /**
     * Set service health status
     */
    setServiceHealth(serviceId: IVSCodeServiceIdentifier<any>, healthy: boolean): void;
    /**
     * Get service dependency graph
     */
    getDependencyGraph(): Map<string, ServiceDependency[]>;
    /**
     * Validate service dependencies
     */
    validateDependenciesForService(serviceId: IVSCodeServiceIdentifier<any>): {
        success: boolean;
        missing: string[];
        healthy: boolean;
    };
    /**
     * Get service statistics
     */
    getServiceStatistics(): {
        totalServices: number;
        healthyServices: number;
        unhealthyServices: number;
        dependencyGraphSize: number;
    };
    /**
     * ADVANCED DISPOSAL: Comprehensive resource cleanup
     */
    dispose(): void;
    /**
     * Restart service adapter with new configuration
     */
    restart(config?: Partial<ServiceAdapterConfig>): Promise<boolean>;
}
export {};
//# sourceMappingURL=ServiceAdapter.d.ts.map