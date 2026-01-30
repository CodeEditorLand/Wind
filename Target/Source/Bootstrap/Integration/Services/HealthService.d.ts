/**
 * @module HealthService
 * @description
 * Wind's Health Service for real-time service discovery and health monitoring
 * Provides comprehensive health monitoring for Mountain services and Wind components
 *
 * Features:
 * - Real-time service discovery
 * - Health status monitoring
 * - Performance metrics collection
 * - Error recovery mechanisms
 * - Service dependency tracking
 * - Health status reporting
 */
/**
 * Service health status
 */
export declare enum ServiceHealthStatus {
    HEALTHY = "healthy",
    DEGRADED = "degraded",
    UNHEALTHY = "unhealthy",
    UNKNOWN = "unknown"
}
/**
 * Service discovery information
 */
export interface ServiceInfo {
    name: string;
    version: string;
    status: ServiceHealthStatus;
    lastHeartbeat: number;
    uptime: number;
    dependencies: string[];
    metrics: ServiceMetrics;
    endpoint?: string;
    port?: number;
}
/**
 * Service performance metrics
 */
export interface ServiceMetrics {
    responseTime: number;
    errorRate: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
    lastUpdated: number;
}
/**
 * Health monitoring configuration
 */
export interface HealthConfig {
    heartbeatInterval: number;
    healthCheckInterval: number;
    timeoutThreshold: number;
    errorThreshold: number;
    enableAutoRecovery: boolean;
    maxRetryAttempts: number;
}
/**
 * Health event
 */
export interface HealthEvent {
    type: 'service_discovered' | 'service_healthy' | 'service_degraded' | 'service_unhealthy' | 'service_lost' | 'recovery_attempted' | 'recovery_successful';
    timestamp: number;
    service: string;
    data?: any;
    error?: string;
}
/**
 * Service discovery and health monitoring service
 */
export declare class HealthService {
    private discoveredServices;
    private healthConfig;
    private eventListeners;
    private heartbeatIntervalId;
    private healthCheckIntervalId;
    private serviceDependencies;
    private errorCounts;
    private recoveryAttempts;
    constructor(config?: Partial<HealthConfig>);
    /**
     * Initialize health service
     */
    private initialize;
    /**
     * Set up event listeners for Mountain health events
     */
    private setupEventListeners;
    /**
     * Discover available Mountain services
     */
    private discoverServices;
    /**
     * Register a discovered service
     */
    private registerService;
    /**
     * Map Mountain status to Wind health status
     */
    private mapStatus;
    /**
     * Start heartbeat monitoring
     */
    private startHeartbeatMonitoring;
    /**
     * Check service heartbeats
     */
    private checkServiceHeartbeats;
    /**
     * Start health checks
     */
    private startHealthChecks;
    /**
     * Perform comprehensive health checks
     */
    private performHealthChecks;
    /**
     * Check individual service health
     */
    private checkServiceHealth;
    /**
     * Attempt service recovery
     */
    private attemptServiceRecovery;
    /**
     * Wait for service recovery
     */
    private waitForServiceRecovery;
    /**
     * Handle Mountain service status updates
     */
    private handleMountainServiceStatus;
    /**
     * Handle Mountain health alerts
     */
    private handleMountainHealthAlert;
    /**
     * Handle Mountain performance metrics
     */
    private handleMountainPerformanceMetrics;
    /**
     * Emit health event
     */
    private emitEvent;
    /**
     * Add event listener
     */
    onHealthEvent(listener: (event: HealthEvent) => void): void;
    /**
     * Remove event listener
     */
    offHealthEvent(listener: (event: HealthEvent) => void): void;
    /**
     * Get discovered services
     */
    getDiscoveredServices(): Map<string, ServiceInfo>;
    /**
     * Get service health status
     */
    getServiceHealth(serviceName: string): ServiceInfo | undefined;
    /**
     * Get overall system health
     */
    getSystemHealth(): {
        overallStatus: ServiceHealthStatus;
        healthyServices: number;
        totalServices: number;
        degradedServices: number;
        unhealthyServices: number;
    };
    /**
     * Get service dependencies
     */
    getServiceDependencies(serviceName: string): string[];
    /**
     * Get error count for service
     */
    getServiceErrorCount(serviceName: string): number;
    /**
     * Get recovery attempts for service
     */
    getRecoveryAttempts(serviceName: string): number;
    /**
     * Manually trigger service discovery
     */
    triggerServiceDiscovery(): Promise<void>;
    /**
     * Manually trigger health check
     */
    triggerHealthCheck(): Promise<void>;
    /**
     * Dispose health service
     */
    dispose(): void;
}
/**
 * Singleton instance
 */
export declare const healthService: HealthService;
//# sourceMappingURL=HealthService.d.ts.map