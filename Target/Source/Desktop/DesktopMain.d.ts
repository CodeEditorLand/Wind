/**
 * @module DesktopMain
 * @description
 * Main entry point for desktop VSCode workbench running in Tauri.
 * This replaces the Electron-based DesktopMain with Tauri equivalents.
 *
 * Architecture:
 * 1. Initialize Tauri API shims and desktop environment
 * 2. Set up service collection with Tauri-specific implementations
 * 3. Create desktop workbench with proper window management
 * 4. Handle desktop-specific lifecycle events
 *
 * ADVANCED FEATURES:
 * - Comprehensive Mountain-Wind integration with configuration sync
 * - Advanced configuration validation and versioning
 * - Configuration migration system for schema updates
 * - Configuration backup and restore capabilities
 * - Advanced error handling and recovery
 * - Performance monitoring and telemetry
 * - Service lifecycle management
 * - Configuration synchronization with Mountain
 * - Tauri IPC bridge for main process communication
 * - Desktop-specific service implementations
 * - Advanced Wind-Mountain synchronization
 * - Comprehensive error recovery strategies
 * - Service health monitoring
 * - Performance profiling capabilities
 * - Configuration validation with schema enforcement
 * - Telemetry and analytics
 * - Graceful degradation
 * - Service dependency resolution
 */
import { Disposable, URI, type ILogService } from "../Mocks/MicrosoftVSCodeMocks.js";
/**
 * Advanced Configuration Management System
 */
/**
 * Configuration schema validator
 */
interface IConfigurationSchema {
    readonly name: string;
    readonly version: string;
    readonly properties: Record<string, any>;
    readonly required?: string[];
    readonly description?: string;
}
/**
 * Configuration validation result
 */
interface IConfigurationValidationResult {
    readonly valid: boolean;
    readonly errors: string[];
    readonly warnings: string[];
}
/**
 * Configuration version info
 */
interface IConfigurationVersion {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly timestamp: number;
    readonly hash?: string;
}
/**
 * Configuration backup
 */
interface IConfigurationBackup {
    readonly id: string;
    readonly timestamp: number;
    readonly version: IConfigurationVersion;
    readonly data: any;
    readonly description?: string;
    readonly automatic: boolean;
}
/**
 * Configuration migration
 */
interface IConfigurationMigration {
    readonly fromVersion: IConfigurationVersion;
    readonly toVersion: IConfigurationVersion;
    readonly migrate: (oldConfig: any) => any;
    readonly validate: (config: any) => boolean;
}
/**
 * Advanced Configuration Validator
 */
declare class ConfigurationValidator {
    private schemas;
    registerSchema(schema: IConfigurationSchema): void;
    validate(configName: string, config: any): IConfigurationValidationResult;
    validateMultiple(configs: Record<string, any>): IConfigurationValidationResult;
}
/**
 * Advanced Configuration Manager with versioning and migration
 */
declare class AdvancedConfigurationManager {
    private currentVersion;
    private versionResolver;
    private migrations;
    private validator;
    private backups;
    private maxBackups;
    /**
     * Register configuration schema
     */
    registerSchema(schema: IConfigurationSchema): void;
    /**
     * Register configuration migration
     */
    registerMigration(migration: IConfigurationMigration): void;
    /**
     * Validate configuration
     */
    validate(configName: string, config: any): IConfigurationValidationResult;
    /**
     * Migrate configuration from older version to current version
     */
    migrateConfiguration(config: any, fromVersion: IConfigurationVersion): Promise<any>;
    /**
     * Get applicable migrations for a version range
     */
    private getApplicableMigrations;
    /**
     * Create configuration backup
     */
    createBackup(config: any, description?: string, automatic?: boolean): Promise<IConfigurationBackup>;
    /**
     * Restore configuration from backup
     */
    restoreFromBackup(backupId: string): Promise<any>;
    /**
     * Get backup list
     */
    getBackupList(): IConfigurationBackup[];
    /**
     * Delete backup
     */
    deleteBackup(backupId: string): void;
    /**
     * Set current version
     */
    setCurrentVersion(version: IConfigurationVersion): void;
    /**
     * Get current version
     */
    getCurrentVersion(): IConfigurationVersion;
}
/**
 * Mountain Configuration Synchronizer
 */
declare class MountainConfigurationSynchronizer {
    private logService;
    private isInitialized;
    private lastSyncTime;
    private syncInterval;
    private isSyncing;
    constructor(logService: ILogService);
    /**
     * Initialize synchronizer
     */
    initialize(): Promise<void>;
    /**
     * Start periodic synchronization
     */
    private startPeriodicSync;
    /**
     * Synchronize configuration with Mountain
     */
    synchronizeConfiguration(windConfig: any, configManager: AdvancedConfigurationManager): Promise<{
        success: boolean;
        mergedConfig: any;
        warnings: string[];
    }>;
    /**
     * Get Mountain configuration via IPC
     */
    private getMountainConfiguration;
    /**
     * Merge Wind and Mountain configurations
     */
    private mergeConfigurations;
    /**
     * Get last sync time
     */
    getLastSyncTime(): number;
}
/**
 * Desktop configuration for Tauri environment
 */
interface ITauriDesktopConfiguration {
    windowId: number;
    appRoot: string;
    userDataPath: string;
    tempPath: string;
    logLevel: string;
    isPackaged: boolean;
    tauriVersion: string;
    platform: string;
    arch: string;
}
/**
 * Combined configuration for desktop workbench
 */
interface IDesktopConfiguration extends ITauriDesktopConfiguration {
    workspace?: any;
    filesToOpenOrCreate?: Array<{
        fileUri: URI;
    }>;
    filesToDiff?: Array<{
        fileUri: URI;
    }>;
    filesToWait?: {
        waitMarkerFileUri: URI;
        paths: Array<{
            fileUri: URI;
        }>;
    };
    fullscreen?: boolean;
    zoomLevel?: number;
    isCustomZoomLevel?: boolean;
    profiles: {
        all: any[];
        home: URI;
        profile: any;
    };
    policiesData?: any;
    loggers: Array<{
        resource: any;
    }>;
    backupPath?: string;
    "disable-layout-restore"?: boolean;
    os: {
        release: string;
    };
}
export declare class WindDesktopMain extends Disposable {
    private readonly configuration;
    private readonly lifecycleCleanupFunctions;
    private readonly productInformation;
    private readonly isTauriEnvironment;
    private readonly isBrowserEnvironment;
    private performanceMonitor;
    private windErrorRecovery;
    private serviceHealthMonitor;
    private errorTracker;
    private degradationManager;
    private serviceManager;
    private configurationManager;
    private mountainSynchronizer;
    private logService?;
    private lazyLoadingServiceManager;
    constructor(configuration: IDesktopConfiguration);
    /**
     * Initialize configuration schemas with validation rules
     */
    private initializeConfigurationSchemas;
    /**
     * Register configuration migrations for schema updates
     */
    private registerConfigurationMigrations;
    private loadProductInformation;
    private init;
    private initBasicIntegration;
    private initAdvancedServices;
    private waitForDOMReady;
    private applyAdvancedWindowConfiguration;
    private createAdvancedWorkbench;
    private registerAdvancedListeners;
    private startupAdvancedWorkbench;
    private createAdvancedDesktopWindow;
    private initializeAdvancedFeatures;
    /**
     * Detects if running in a Tauri environment.
     *
     * @returns true if Tauri APIs are available, false otherwise
     */
    private detectTauriEnvironment;
    /**
     * Sets the window fullscreen state.
     * Works in both Tauri and browser environments.
     *
     * @param fullscreen - Whether to enter or exit fullscreen mode
     * @returns Promise that resolves when fullscreen state is set
     * @throws Error if fullscreen operation fails in Tauri environment
     */
    private setFullscreen;
    /**
     * Sets fullscreen state using browser Fullscreen API.
     *
     * @param fullscreen - Whether to enter or exit fullscreen mode
     */
    private setBrowserFullscreen;
    /**
     * Detects the macOS version from the browser's user agent string.
     *
     * @returns macOS version string (e.g., "14.2.1") or null if not detectable
     */
    private getMacOSVersion;
    private useMacOSVersion;
    /**
     * Send analytics event to Mountain
     */
    private sendToMountainAnalytics;
    /**
     * Initialize advanced Wind-Mountain integration
     */
    private initAdvancedIntegration;
    /**
     * Initialize configuration management system
     */
    private initializeConfigurationManagement;
    /**
     * Validate and migrate configuration if needed
     */
    private validateAndMigrateConfiguration;
    /**
     * Add initial documents for synchronization
     */
    private addInitialDocumentsForSync;
    /**
     * Set up collaboration sessions
     */
    private setupCollaborationSessions;
    /**
     * Subscribe to real-time updates
     */
    private subscribeToRealTimeUpdates;
    private reviveUris;
    /**
     * Converts a serialized URI string back to a URI object.
     * Handles URI components: scheme, authority, path, query, fragment.
     *
     * @param uriOrString - Either a URI object (returned as-is) or a serialized URI string
     * @returns A revived URI object
     * @throws Error if URI string is invalid and cannot be revived
     */
    private reviveURI;
    open(): Promise<void>;
    /**
     * Analyze and optimize startup performance
     */
    private analyzeAndOptimizeStartup;
    private applyWindowZoomLevel;
    /**
     * Get current system health status
     */
    getHealthStatus(): {
        timestamp: number;
        overallHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
        services: Record<string, ServiceHealthStatus>;
        errorStats: any;
        degradation: any;
    };
    /**
     * Get comprehensive error report
     */
    getErrorReport(): any;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): Record<string, any>;
    /**
     * Get graceful degradation status
     */
    getDegradationStatus(): any;
    /**
     * Trigger system diagnostics and recovery
     */
    runDiagnosticsAndRecovery(): Promise<{
        healthy: boolean;
        issues: string[];
        recommendations: string[];
    }>;
    private getExtraClasses;
    private registerListeners;
    private initServices;
    /**
     * Load and validate configuration from storage
     */
    private loadAndValidateConfiguration;
    private createFallbackServices;
    private createEnhancedLogService;
    private createEnhancedStorageService;
    /**
     * Create enhanced configuration service with backup/restore capabilities
     */
    private createEnhancedConfigurationService;
    /**
     * Get configuration storage
     */
    private getConfigurationStorage;
    /**
     * Create configuration backup
     */
    createConfigurationBackup(description?: string): Promise<string>;
    /**
     * Restore configuration from backup
     */
    restoreConfigurationFromBackup(backupId: string): Promise<void>;
    /**
     * Get configuration backups list
     */
    getConfigurationBackups(): Array<{
        id: string;
        timestamp: number;
        description?: string;
    }>;
    /**
     * Delete configuration backup
     */
    deleteConfigurationBackup(backupId: string): void;
    private initializeMountainIntegration;
    /**
     * Initialize service orchestration system
     */
    private initializeServiceOrchestration;
    /**
     * Start service health monitoring
     */
    private startServiceHealthMonitoring;
    /**
     * Get service manager instance
     */
    getServiceManager(): AdvancedServiceManager;
    /**
     * Get log manager instance
     */
    getLogManager(): LogManager;
    /**
     * Get service registry
     */
    getServiceRegistry(): ServiceRegistry;
    /**
     * Perform a service restart
     */
    restartService(serviceName: string): Promise<boolean>;
    /**
     * Get health status of all services
     */
    checkServiceHealth(): Promise<IServiceHealthStatus[]>;
    /**
     * Shutdown all services gracefully
     */
    shutdownServices(): Promise<void>;
    /**
     * Get service state
     */
    getServiceState(serviceName: string): ServiceLifecycleState;
    /**
     * Get log entries
     */
    getLogEntries(count?: number): any[];
    /**
     * Set log level
     */
    setLogLevel(level: "trace" | "debug" | "info" | "warn" | "error"): void;
    /**
     * Get service dependency information
     */
    getServiceDependencies(): Record<string, string[]>;
    /**
     * Get comprehensive service status report
     */
    getServiceStatusReport(): Promise<{
        timestamp: number;
        services: IServiceHealthStatus[];
        dependencies: Record<string, string[]>;
        systemHealth: "healthy" | "degraded" | "critical";
    }>;
}
/**
 * Desktop main function - entry point for desktop workbench
 */
export declare function windDesktopMain(configuration: IDesktopConfiguration): Promise<void>;
/**
 * Advanced performance metrics interface
 */
interface PerformanceMetrics {
    timings: Map<string, number>;
    memory: {
        heapUsed: number;
        heapMax: number;
        jsHeapUsed: number;
        jsHeapLimit: number;
        externalMemory: number;
        totalMemoryUsage: number;
    };
    network: {
        resourceCount: number;
        totalSize: number;
        averageLatency: number;
        failedRequests: number;
    };
    rendering: {
        frameCount: number;
        averageFPS: number;
        layoutCount: number;
        paintCount: number;
    };
    services: Map<string, ServiceMetric>;
    startup: {
        totalTime: number;
        phases: Map<string, number>;
        criticalPath: string[];
    };
}
/**
 * Service metric data
 */
interface ServiceMetric {
    name: string;
    initTime: number;
    status: "initializing" | "ready" | "error";
    memoryUsage: number;
    loadTime: number;
    lazyLoaded: boolean;
}
/**
 * Advanced performance monitoring system for Wind
 * Tracks detailed performance metrics, memory usage, and startup optimization
 */
declare class WindPerformanceMonitor {
    private metrics;
    private timers;
    private performanceEntries;
    private memoryCheckInterval;
    private rafObserver;
    private analyticsQueue;
    private startupPhases;
    private mountainIntegration;
    /**
     * Initialize the performance monitor
     */
    initialize(): void;
    /**
     * Start a performance timer with automatic context
     */
    startTimer(key: string, context?: Record<string, any>): void;
    /**
     * End a performance timer and record the measurement
     */
    endTimer(key: string, metadata?: Record<string, any>): number;
    /**
     * Record service initialization metric
     */
    recordServiceMetric(serviceName: string, metric: Partial<ServiceMetric>): void;
    /**
     * Start memory monitoring with periodic updates
     */
    private startMemoryMonitoring;
    /**
     * Update memory metrics from performance API
     */
    private updateMemoryMetrics;
    /**
     * Start frame rate monitoring
     */
    private startFrameRateMonitoring;
    /**
     * Start resource tracking
     */
    private startResourceTracking;
    /**
     * Optimize startup performance
     */
    optimizeStartup(): StartupOptimizationResult;
    /**
     * Calculate critical path for startup
     */
    private calculateCriticalPath;
    /**
     * Initialize Mountain analytics integration
     */
    private initializeMountainAnalytics;
    /**
     * Queue an analytics event
     */
    private queueAnalyticsEvent;
    /**
     * Flush queued analytics events to Mountain
     */
    flushAnalytics(): Promise<void>;
    /**
     * Suggest garbage collection
     */
    private suggestGarbageCollection;
    /**
     * Get comprehensive performance report
     */
    getPerformanceReport(): PerformanceReport;
    /**
     * Get metrics
     */
    getMetrics(): PerformanceMetrics;
    /**
     * Cleanup resources
     */
    dispose(): void;
}
/**
 * Startup optimization result
 */
interface StartupOptimizationResult {
    optimizations: Array<{
        phase: string;
        issue: string;
        suggestion: string;
        estimatedSavings: number;
    }>;
    criticalPath: string[];
    estimatedSavings: number;
}
/**
 * Performance report
 */
interface PerformanceReport {
    timestamp: number;
    metrics: PerformanceMetrics;
    summary: {
        totalStartupTime: number;
        currentMemoryUsage: number;
        averageFPS: number;
        serviceCount: number;
        criticalPath: string[];
    };
}
/**
 * Advanced error recovery system for Wind with sophisticated fallback mechanisms
 */
declare class WindErrorRecovery {
    private errorCount;
    private errorHistory;
    private maxErrors;
    private maxErrorHistorySize;
    private recoveryStrategies;
    private circuitBreakers;
    private lastErrorResetTime;
    private errorResetInterval;
    private recoveryAttempts;
    private maxRecoveryAttempts;
    constructor();
    /**
     * Setup recovery strategies for different error types
     */
    private setupRecoveryStrategies;
    /**
     * Start automatic error counter reset timer
     */
    private startErrorResetTimer;
    /**
     * Handle error with sophisticated recovery mechanisms
     */
    handleError(error: Error, context: string | any): Promise<boolean>;
    /**
     * Execute recovery with exponential backoff retry logic
     */
    private executeWithRetry;
    /**
     * Generic error recovery fallback
     */
    private genericErrorRecovery;
    /**
     * Get error history for diagnostics
     */
    getErrorHistory(): Array<{
        error: Error;
        context: string;
        timestamp: number;
        attempted: number;
    }>;
    /**
     * Get error statistics
     */
    getErrorStatistics(): {
        totalErrors: number;
        recentErrors: number;
        errorRate: number;
        recoverySuccessRate: number;
    };
    /**
     * Reset error counter
     */
    reset(): void;
    /**
     * Check if system can continue
     */
    canContinue(): boolean;
    /**
     * Get error count
     */
    getErrorCount(): number;
    /**
     * Helper function for delays with jitter
     */
    private delay;
    /**
     * Get circuit breaker status
     */
    getCircuitBreakerStatus(): Record<string, {
        state: string;
        failures: number;
        lastFailureTime: number | null;
    }>;
    /**
     * Dispose error recovery system
     */
    dispose(): void;
}
/**
 * Circuit Breaker pattern implementation for service resilience
 */
declare class CircuitBreaker {
    private name;
    private failureThreshold;
    private resetTimeout;
    private failureCount;
    private successCount;
    private lastFailureTime;
    private state;
    private stateChangeTime;
    constructor(name: string, failureThreshold?: number, resetTimeout?: number);
    /**
     * Record successful operation
     */
    recordSuccess(): void;
    /**
     * Record failed operation
     */
    recordError(): void;
    /**
     * Check if circuit is open
     */
    isOpen(): boolean;
    /**
     * Check if circuit is in half-open state
     */
    isHalfOpen(): boolean;
    /**
     * Get failure count
     */
    getFailureCount(): number;
    /**
     * Get last failure time
     */
    getLastFailureTime(): number | null;
    /**
     * Get circuit breaker state
     */
    getState(): string;
    /**
     * Dispose circuit breaker
     */
    dispose(): void;
}
/**
 * Service health monitoring system for Wind
 */
declare class ServiceHealthMonitor {
    private services;
    private healthChecks;
    private checkInterval;
    private isMonitoring;
    private monitoringTimer;
    private degradedServiceList;
    constructor();
    /**
     * Register a service for health monitoring
     */
    registerService(serviceName: string, healthCheck: () => Promise<boolean>, criticalService?: boolean): void;
    /**
     * Start health monitoring
     */
    startMonitoring(): void;
    /**
     * Stop health monitoring
     */
    stopMonitoring(): void;
    /**
     * Check all services health
     */
    private checkAllServices;
    /**
     * Check individual service health
     */
    private checkService;
    /**
     * Mark service as unhealthy
     */
    private markServiceUnhealthy;
    /**
     * Handle critical service failure
     */
    private handleCriticalServiceFailure;
    /**
     * Get service health status
     */
    getServiceHealth(serviceName: string): ServiceHealthStatus | null;
    /**
     * Get all services health status
     */
    getAllServicesHealth(): Record<string, ServiceHealthStatus>;
    /**
     * Check if critical services are degraded
     */
    hasCriticalServiceDegradation(): boolean;
    /**
     * Get degraded services list
     */
    getDegradedServices(): string[];
    /**
     * Get health report
     */
    getHealthReport(): {
        timestamp: number;
        overallHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
        totalServices: number;
        healthyServices: number;
        degradedServices: number;
        criticalIssues: boolean;
        services: Record<string, ServiceHealthStatus>;
    };
    /**
     * Create a timeout promise
     */
    private createTimeoutPromise;
    /**
     * Dispose health monitor
     */
    dispose(): void;
}
/**
 * Service health status interface
 */
interface ServiceHealthStatus {
    name: string;
    healthy: boolean;
    lastCheckTime: number;
    consecutiveFailures: number;
    isCritical: boolean;
    degradationLevel: number;
    lastError: string | null;
}
/**
 * Advanced Mountain integration service
 */
declare class MountainIntegrationService {
    private isInitialized;
    private performanceQueue;
    initialize(): Promise<void>;
    syncConfiguration(config: any): Promise<void>;
    trackPerformance(metrics: any): Promise<void>;
    private processPerformanceQueue;
}
export { WindDesktopMain as DesktopMain };
export { WindPerformanceMonitor, WindErrorRecovery, MountainIntegrationService, ConfigurationValidator, AdvancedConfigurationManager, MountainConfigurationSynchronizer, ServiceHealthMonitor, ErrorTrackingService, GracefulDegradationManager, CircuitBreaker, };
export type { IConfigurationSchema, IConfigurationValidationResult, IConfigurationVersion, IConfigurationBackup, IConfigurationMigration, };
/**
 * Comprehensive error tracking and reporting system
 */
declare class ErrorTrackingService {
    private errorLog;
    private errorSummary;
    private maxLogSize;
    private reportingEnabled;
    private errorThresholds;
    constructor();
    /**
     * Initialize default error thresholds
     */
    private initializeDefaultThresholds;
    /**
     * Track an error occurrence
     */
    trackError(error: Error, context: string, severity?: "low" | "medium" | "high" | "critical", metadata?: Record<string, any>): void;
    /**
     * Check if error threshold is exceeded
     */
    private checkErrorThreshold;
    /**
     * Report error to backend or logging service
     */
    private reportError;
    /**
     * Trigger alert for critical issues
     */
    private triggerAlert;
    /**
     * Get error log
     */
    getErrorLog(limit?: number): ErrorLogEntry[];
    /**
     * Get error summary
     */
    getErrorSummary(): Record<string, Omit<ErrorSummary, "contexts"> & {
        contexts: string[];
    }>;
    /**
     * Clear error history
     */
    clearHistory(): void;
    /**
     * Get comprehensive error report
     */
    getComprehensiveReport(): ErrorReport;
    /**
     * Get top errors by occurrence
     */
    private getTopErrors;
    /**
     * Dispose error tracking service
     */
    dispose(): void;
}
/**
 * Graceful degradation manager for Wind
 */
declare class GracefulDegradationManager {
    private degradedFeatures;
    private fallbackModes;
    private degradationLevel;
    private performanceThresholds;
    constructor();
    /**
     * Setup fallback modes for different scenarios
     */
    private setupFallbackModes;
    /**
     * Degrade specific feature
     */
    degradeFeature(featureName: string, reason: string): void;
    /**
     * Restore degraded feature
     */
    restoreFeature(featureName: string): void;
    /**
     * Evaluate and adjust degradation level
     */
    private evaluateDegradationLevel;
    /**
     * Apply degradation mode
     */
    private applyDegradationMode;
    /**
     * Check system resources and degrade if necessary
     */
    checkSystemResources(metrics: SystemMetrics): void;
    /**
     * Get degradation status
     */
    getDegradationStatus(): {
        level: number;
        degradedFeatures: string[];
        mode: string;
    };
    /**
     * Get fallback mode details
     */
    getFallbackModeDetails(level: number): FallbackMode | null;
    /**
     * Dispose degradation manager
     */
    dispose(): void;
}
/**
 * Error log entry interface
 */
interface ErrorLogEntry {
    timestamp: number;
    errorType: string;
    message: string;
    context: string;
    severity: "low" | "medium" | "high" | "critical";
    stack: string;
    metadata?: Record<string, any>;
    reported: boolean;
}
/**
 * Error summary interface
 */
interface ErrorSummary {
    errorType: string;
    occurrences: number;
    lastOccurrence: number;
    contexts: Set<string>;
    severity: string;
}
/**
 * Error report interface
 */
interface ErrorReport {
    timestamp: number;
    totalErrors: number;
    errors1h: number;
    errors24h: number;
    severityBreakdown: Record<string, number>;
    topErrors: Array<{
        errorType: string;
        count: number;
    }>;
    recentErrors: ErrorLogEntry[];
}
/**
 * Fallback mode interface
 */
interface FallbackMode {
    level: number;
    disabledFeatures: string[];
    enabledFeatures: string[];
    description: string;
}
/**
 * System metrics interface
 */
interface SystemMetrics {
    cpuUsage: number;
    memoryUsage: number;
    averageResponseTime: number;
    errorRate: number;
}
/**
 * Service lifecycle state enumeration
 */
declare enum ServiceLifecycleState {
    Uninitialized = "uninitialized",
    Initializing = "initializing",
    Ready = "ready",
    Running = "running",
    Restarting = "restarting",
    Degraded = "degraded",
    Stopping = "stopping",
    Stopped = "stopped",
    Error = "error"
}
/**
 * Service health status
 */
interface IServiceHealthStatus {
    serviceName: string;
    state: ServiceLifecycleState;
    healthy: boolean;
    lastCheck: number;
    errorCount: number;
    lastError?: string;
    responseTime?: number;
}
/**
 * Enhanced logging with levels and context
 */
declare class LogManager {
    private logLevels;
    private currentLevel;
    private logs;
    private maxLogs;
    setLevel(level: "trace" | "debug" | "info" | "warn" | "error"): void;
    private shouldLog;
    private formatMessage;
    trace(context: string, message: string, ...args: any[]): void;
    debug(context: string, message: string, ...args: any[]): void;
    info(context: string, message: string, ...args: any[]): void;
    warn(context: string, message: string, ...args: any[]): void;
    error(context: string, message: string, ...args: any[]): void;
    private addLog;
    getLogs(): Array<{
        timestamp: number;
        level: string;
        context: string;
        message: string;
        args: any[];
    }>;
    clearLogs(): void;
}
/**
 * Service registry with lifecycle management
 */
declare class ServiceRegistry {
    private services;
    private states;
    private dependencies;
    private healthStatus;
    private logManager;
    constructor(logManager: LogManager);
    registerService(name: string, service: any, dependencies?: string[]): void;
    getService<T>(name: string): T;
    getState(name: string): ServiceLifecycleState;
    setState(name: string, state: ServiceLifecycleState): void;
    getDependencies(name: string): string[];
    areAllDependenciesReady(name: string): boolean;
    getHealthStatus(name: string): IServiceHealthStatus | undefined;
    updateHealthStatus(name: string, status: Partial<IServiceHealthStatus>): void;
    getAllServices(): Array<[string, any]>;
    getAllHealthStatus(): IServiceHealthStatus[];
}
/**
 * Service restart manager
 */
declare class ServiceRestartManager {
    private restartAttempts;
    private maxRestartAttempts;
    private restartDelay;
    private logManager;
    private registry;
    constructor(logManager: LogManager, registry: ServiceRegistry);
    restartService(serviceName: string, shutdownFn: () => Promise<void>, initializeFn: () => Promise<void>): Promise<boolean>;
    resetRestartAttempts(serviceName: string): void;
    getRestartAttempts(serviceName: string): number;
}
/**
 * Advanced service orchestration manager
 */
declare class AdvancedServiceManager {
    private logManager;
    private registry;
    private graph;
    private healthMonitor;
    private restartManager;
    constructor();
    registerService(name: string, service: any, dependencies?: string[]): void;
    registerHealthCheck(serviceName: string, checkFn: () => Promise<boolean>, intervalMs?: number): void;
    initializeServices(): Promise<void>;
    private initializeService;
    getLogManager(): LogManager;
    getRegistry(): ServiceRegistry;
    getHealthMonitor(): ServiceHealthMonitor;
    getRestartManager(): ServiceRestartManager;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=DesktopMain.d.ts.map