/**
 * @module MountainIntegrationService
 * @description
 * Advanced service for integrating Wind with Mountain backend.
 * Handles gRPC communication, configuration synchronization, and real-time updates.
 *
 * Architecture:
 * - Manages Mountain gRPC client connections
 * - Synchronizes Wind configuration with Mountain
 * - Handles real-time collaboration features
 * - Provides error recovery and reconnection logic
 * - Supports advanced debugging and telemetry
 */
interface MountainSyncResult {
    success: boolean;
    synchronizedItems: number;
    warnings: string[];
}
interface RealTimeUpdate {
    type: 'document-change' | 'cursor-update' | 'collaboration-event' | 'configuration-change';
    payload: any;
    timestamp: number;
}
export declare class MountainIntegrationService {
    private isConnected;
    private connectionConfig;
    private retryCount;
    private connectionTimeout?;
    private realTimeSubscribers;
    private collaborationSessions;
    private grpcChannel?;
    private grpcClient?;
    private grpcCallOptions;
    private errorStats;
    private performanceMetrics;
    private _monitorResourceUsage;
    constructor();
    private _initializePerformanceTracking;
    private _connectionPerformance;
    private _messagePerformance;
    /**
     * Initialize advanced features
     */
    private _initializeAdvancedFeatures;
    /**
     * Set up advanced error tracking - Enhanced Microsoft pattern
     */
    private _setupAdvancedErrorTracking;
    /**
     * Initialize performance monitoring - Enhanced Microsoft pattern
     */
    private _initializePerformanceMonitoring;
    private _degradePerformanceForHighLatency;
    private _prioritizeCriticalMessages;
    private _optimizeThroughput;
    private _updatePerformanceTrend;
    /**
     * Set up advanced reconnection logic
     */
    private _setupAdvancedReconnection;
    private _analyzeErrorPatterns?;
    private _addErrorToWindow?;
    private _trackConnectionPerformance?;
    private _trackMessageLatency?;
    private _calculateThroughput?;
    private _shouldAttemptReconnection?;
    private _calculateReconnectionDelay?;
    /**
     * Get default Mountain connection configuration
     */
    private getDefaultConfig;
    /**
     * Initialize Mountain integration service
     */
    initialize(): Promise<void>;
    /**
     * Load configuration from environment variables with advanced validation
     * Microsoft Source Reference: Configuration loading patterns
     */
    private loadConfigurationFromEnvironment;
    private _validateConfiguration;
    /**
     * Initialize gRPC client with advanced error handling
     * Microsoft Source Reference: gRPC client initialization patterns
     */
    private initializeGrpcClient;
    private _checkGrpcDependencies;
    private _trackGrpcInitializationPerformance;
    private _handleGrpcInitializationError;
    private _classifyGrpcError;
    /**
     * Load Mountain proto definitions
     */
    private loadMountainProtoDefinitions;
    /**
     * Create gRPC channel credentials
     */
    private createChannelCredentials;
    /**
     * Initialize gRPC client stubs
     */
    private initializeClientStubs;
    /**
     * Create service client
     */
    private createServiceClient;
    /**
     * Perform gRPC call
     */
    private performGrpcCall;
    /**
     * Set up connection monitoring
     */
    private setupConnectionMonitoring;
    /**
     * Connect to Mountain backend
     */
    connect(): Promise<void>;
    /**
     * Attempt connection with retry logic
     */
    private attemptConnectionWithRetry;
    /**
     * Perform actual connection to Mountain
     */
    private performConnection;
    /**
     * Synchronize configuration with Mountain
     */
    synchronizeConfiguration(): Promise<MountainSyncResult>;
    /**
     * Perform actual configuration synchronization
     */
    private performConfigurationSync;
    /**
     * Get Wind configuration
     */
    private getWindConfiguration;
    /**
     * Merge Wind and Mountain configurations
     */
    private mergeConfigurations;
    /**
     * Validate configuration
     */
    private validateConfiguration;
    /**
     * Apply configuration
     */
    private applyConfiguration;
    /**
     * Initialize real-time communication
     */
    initializeRealTimeCommunication(): Promise<void>;
    /**
     * Set up real-time channels
     */
    private setupRealTimeChannels;
    /**
     * Start listening for updates
     */
    private startListeningForUpdates;
    /**
     * Subscribe to real-time updates
     */
    subscribe(callback: (update: RealTimeUpdate) => void): () => void;
    /**
     * Notify subscribers of updates
     */
    private notifySubscribers;
    /**
     * Perform health check
     */
    performHealthCheck(): Promise<boolean>;
    /**
     * Disconnect from Mountain
     */
    disconnect(): Promise<void>;
    /**
     * Track performance metrics to Mountain analytics
     */
    trackPerformanceMetrics(metrics: any): Promise<void>;
    /**
     * Track error to Mountain error tracking
     */
    trackError(error: Error, context?: any): Promise<void>;
    /**
     * Send analytics event to Mountain
     */
    sendAnalyticsEvent(eventName: string, eventData?: any): Promise<void>;
    /**
     * Get connection status
     */
    getConnectionStatus(): {
        connected: boolean;
        retryCount: number;
        lastError?: string;
    };
    /**
     * Clean up resources
     */
    cleanup(): void;
}
export {};
//# sourceMappingURL=MountainIntegrationService.d.ts.map