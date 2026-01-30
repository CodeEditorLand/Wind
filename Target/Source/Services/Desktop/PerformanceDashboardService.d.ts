/**
 * Performance Dashboard Service
 *
 * Real-time performance monitoring and visualization for advanced synchronization
 * Integrates with Mountain's performance tracking capabilities
 */
export interface IPerformanceDashboard {
    startMonitoring(): Promise<void>;
    stopMonitoring(): Promise<void>;
    getPerformanceMetrics(): IPerformanceMetrics;
    getHistoricalData(timeRange: string): IHistoricalMetrics[];
    setPerformanceThresholds(thresholds: IPerformanceThresholds): void;
    alertOnPerformanceIssues(callback: (alert: IPerformanceAlert) => void): void;
}
export interface IPerformanceMetrics {
    cpu: {
        usage: number;
        cores: number;
        threads: number;
    };
    memory: {
        used: number;
        total: number;
        heap: number;
    };
    network: {
        latency: number;
        throughput: number;
        connections: number;
    };
    synchronization: {
        syncRate: number;
        conflictRate: number;
        successRate: number;
    };
    ui: {
        fps: number;
        renderTime: number;
        interactionDelay: number;
    };
    timestamp: number;
}
export interface IHistoricalMetrics extends IPerformanceMetrics {
    timestamp: number;
    interval: number;
}
export interface IPerformanceThresholds {
    cpu: {
        warning: number;
        critical: number;
    };
    memory: {
        warning: number;
        critical: number;
    };
    network: {
        latencyWarning: number;
        latencyCritical: number;
        throughputWarning: number;
    };
    synchronization: {
        syncRateWarning: number;
        conflictRateWarning: number;
        successRateWarning: number;
    };
}
export interface IPerformanceAlert {
    alertId: string;
    type: 'warning' | 'critical' | 'info';
    metric: string;
    value: number;
    threshold: number;
    timestamp: number;
    description: string;
    recommendations: string[];
}
export declare class PerformanceDashboardService implements IPerformanceDashboard {
    private static instance;
    private isMonitoring;
    private metrics;
    private thresholds;
    private alertCallbacks;
    private monitoringInterval;
    private historicalData;
    constructor();
    /**
     * Get singleton instance
     */
    static getInstance(): PerformanceDashboardService;
    /**
     * Set default performance thresholds
     */
    private setDefaultThresholds;
    /**
     * Start performance monitoring
     */
    startMonitoring(): Promise<void>;
    /**
     * Stop performance monitoring
     */
    stopMonitoring(): Promise<void>;
    /**
     * Set up Mountain performance listeners
     */
    private setupMountainListeners;
    /**
     * Collect performance metrics
     */
    private collectMetrics;
    /**
     * Get CPU metrics
     */
    private getCpuMetrics;
    /**
     * Get memory metrics
     */
    private getMemoryMetrics;
    /**
     * Get network metrics
     */
    private getNetworkMetrics;
    /**
     * Get synchronization metrics
     */
    private getSyncMetrics;
    /**
     * Get UI metrics
     */
    private getUIMetrics;
    /**
     * Handle Mountain performance updates
     */
    private handleMountainPerformanceUpdate;
    /**
     * Handle synchronization metrics
     */
    private handleSyncMetrics;
    /**
     * Check performance thresholds
     */
    private checkThresholds;
    /**
     * Create performance alert
     */
    private createAlert;
    /**
     * Get alert description
     */
    private getAlertDescription;
    /**
     * Get alert recommendations
     */
    private getAlertRecommendations;
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics(): IPerformanceMetrics;
    /**
     * Get default metrics
     */
    private getDefaultMetrics;
    /**
     * Get historical data
     */
    getHistoricalData(timeRange: string): IHistoricalMetrics[];
    /**
     * Set performance thresholds
     */
    setPerformanceThresholds(thresholds: IPerformanceThresholds): void;
    /**
     * Alert on performance issues
     */
    alertOnPerformanceIssues(callback: (alert: IPerformanceAlert) => void): void;
    /**
     * Remove performance alert callback
     */
    removeAlertCallback(callback: (alert: IPerformanceAlert) => void): void;
    /**
     * Get monitoring status
     */
    isMonitoringActive(): boolean;
    /**
     * Get current thresholds
     */
    getCurrentThresholds(): IPerformanceThresholds;
}
export declare const performanceDashboardService: PerformanceDashboardService;
//# sourceMappingURL=PerformanceDashboardService.d.ts.map