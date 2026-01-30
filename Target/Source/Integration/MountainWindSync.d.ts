/**
 * @module MountainWindSync
 * @description
 * Mountain-Wind synchronization service for seamless integration between Wind frontend and Mountain backend.
 * Provides bidirectional communication, configuration sync, and service coordination.
 *
 * Architecture:
 * - Real-time synchronization between Wind and Mountain
 * - Configuration and state management
 * - Service coordination and lifecycle management
 * - Error handling and recovery mechanisms
 * - Advanced synchronization features with performance monitoring
 * - Comprehensive conflict resolution capabilities
 */
/**
 * Synchronization status
 */
export declare enum SyncStatus {
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    SYNCING = "syncing",
    ERROR = "error"
}
/**
 * Synchronization event
 */
export interface ISyncEvent {
    type: 'connected' | 'disconnected' | 'sync_started' | 'sync_completed' | 'error';
    timestamp: number;
    data?: any;
    error?: string;
}
/**
 * Synchronization configuration
 */
export interface ISyncConfig {
    enableRealTimeSync: boolean;
    syncInterval: number;
    enableConflictResolution: boolean;
    maxRetryAttempts: number;
    enablePerformanceMonitoring: boolean;
}
/**
 * Performance telemetry interface
 */
interface PerformanceTelemetry {
    operationId: string;
    operationType: string;
    startTime: number;
    endTime: number;
    duration: number;
    success: boolean;
    dataSize?: number;
    error?: string;
    metadata?: Record<string, any>;
}
/**
 * Mountain-Wind synchronization service
 *
 * Advanced synchronization service providing real-time bidirectional communication
 * between Wind frontend and Mountain backend with comprehensive performance monitoring
 * and conflict resolution capabilities.
 */
export declare class MountainWindSync {
    private status;
    private config;
    private eventListeners;
    private syncIntervalId;
    private retryCount;
    private performanceMetrics;
    private conflictResolver;
    private syncQueue;
    private incrementalSyncManager;
    private telemetryCollector;
    private performanceMonitorInterval;
    constructor(config?: Partial<ISyncConfig>);
    /**
     * Initialize synchronization service
     */
    private initialize;
    /**
     * Set up event listeners for Mountain communication
     */
    private setupEventListeners;
    /**
     * Connect to Mountain backend
     */
    private connect;
    /**
     * Start synchronization
     */
    private startSync;
    /**
     * Perform synchronization
     */
    private synchronize;
    /**
     * Synchronize configuration with advanced features
     * Includes validation, diffing, rollback capabilities, and encryption
     */
    private syncConfiguration;
    /**
     * Synchronize services with advanced management
     * Includes dependency resolution, lifecycle management, health monitoring,
     * restart capabilities, and performance profiling
     */
    private syncServices;
    /**
     * Synchronize state
     */
    private syncState;
    /**
     * Handle Mountain status updates
     */
    private handleMountainStatus;
    /**
     * Handle configuration updates from Mountain
     */
    private handleConfigurationUpdate;
    /**
     * Handle service updates from Mountain
     */
    private handleServiceUpdate;
    /**
     * Get Wind configuration
     */
    private getWindConfiguration;
    /**
     * Get Wind services status
     */
    private getWindServicesStatus;
    /**
     * Get Wind state
     */
    private getWindState;
    /**
     * Get Mountain integration service instance
     */
    private getMountainIntegrationService;
    /**
     * Merge configurations
     */
    private mergeConfigurations;
    /**
     * Apply state
     */
    private applyState;
    /**
     * Merge configurations with conflict resolution
     */
    private mergeConfigurationsWithConflictResolution;
    /**
     * Merge states
     */
    private mergeStates;
    /**
     * Validate configuration structure and values
     */
    private validateConfiguration;
    /**
     * Get nested object value by dot notation key
     */
    private getNestedValue;
    /**
     * Apply configuration
     */
    private applyConfiguration;
    /**
     * Apply configuration with rollback capability
     */
    private applyConfigurationWithRollback;
    /**
     * Verify configuration was applied correctly
     */
    private verifyConfigurationApplication;
    /**
     * Get Wind UI state
     */
    private getWindUIState;
    /**
     * Get Wind editor state
     */
    private getWindEditorState;
    /**
     * Get Wind workspace state
     */
    private getWindWorkspaceState;
    /**
     * Generate unique session ID
     */
    private generateSessionId;
    /**
     * Create comprehensive service synchronization plan
     */
    private createServiceSyncPlan;
    /**
     * Execute service synchronization plan
     */
    private executeServiceSyncPlan;
    /**
     * Start a service
     */
    private startService;
    /**
     * Stop a service
     */
    private stopService;
    /**
     * Update a service
     */
    private updateService;
    /**
     * Update services status
     */
    private updateServicesStatus;
    /**
     * Restart a service
     */
    private restartService;
    /**
     * Emit synchronization event
     */
    private emitEvent;
    /**
     * Add event listener
     */
    onSyncEvent(listener: (event: ISyncEvent) => void): void;
    /**
     * Remove event listener
     */
    offSyncEvent(listener: (event: ISyncEvent) => void): void;
    /**
     * Get synchronization status
     */
    getStatus(): SyncStatus;
    /**
     * Get retry count
     */
    getRetryCount(): number;
    /**
     * Manually trigger synchronization
     */
    triggerSync(): Promise<void>;
    /**
     * Start performance monitoring
     */
    private startPerformanceMonitoring;
    /**
     * Emit performance metrics
     */
    private emitPerformanceMetrics;
    /**
     * Record telemetry
     */
    private recordTelemetry;
    /**
     * Dispose synchronization service
     */
    dispose(): void;
    /**
     * Get performance telemetry
     */
    getPerformanceTelemetry(): PerformanceTelemetry[];
    /**
     * Get performance summary
     */
    getPerformanceSummary(): any;
}
export declare const mountainWindSync: MountainWindSync;
export {};
//# sourceMappingURL=MountainWindSync.d.ts.map