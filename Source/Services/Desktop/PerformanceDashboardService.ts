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

export class PerformanceDashboardService implements IPerformanceDashboard {
    private static instance: PerformanceDashboardService;
    private isMonitoring: boolean = false;
    private metrics: IPerformanceMetrics[] = [];
    private thresholds: IPerformanceThresholds;
    private alertCallbacks: Set<(alert: IPerformanceAlert) => void> = new Set();
    private monitoringInterval: number | null = null;
    private historicalData: Map<number, IHistoricalMetrics> = new Map();

    constructor() {
        this.setDefaultThresholds();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): PerformanceDashboardService {
        if (!PerformanceDashboardService.instance) {
            PerformanceDashboardService.instance = new PerformanceDashboardService();
        }
        return PerformanceDashboardService.instance;
    }

    /**
     * Set default performance thresholds
     */
    private setDefaultThresholds(): void {
        this.thresholds = {
            cpu: {
                warning: 70,
                critical: 90
            },
            memory: {
                warning: 80,
                critical: 95
            },
            network: {
                latencyWarning: 100,
                latencyCritical: 500,
                throughputWarning: 10
            },
            synchronization: {
                syncRateWarning: 0.5,
                conflictRateWarning: 0.1,
                successRateWarning: 0.8
            }
        };
    }

    /**
     * Start performance monitoring
     */
    async startMonitoring(): Promise<void> {
        if (this.isMonitoring) {
            console.warn('[PerformanceDashboardService] Already monitoring');
            return;
        }

        console.log('[PerformanceDashboardService] Starting performance monitoring');
        this.isMonitoring = true;

        // Start monitoring interval
        this.monitoringInterval = window.setInterval(async () => {
            await this.collectMetrics();
        }, 2000); // Collect metrics every 2 seconds

        // Set up Mountain performance listeners
        await this.setupMountainListeners();

        console.log('[PerformanceDashboardService] Performance monitoring started');
    }

    /**
     * Stop performance monitoring
     */
    async stopMonitoring(): Promise<void> {
        if (!this.isMonitoring) {
            console.warn('[PerformanceDashboardService] Not monitoring');
            return;
        }

        console.log('[PerformanceDashboardService] Stopping performance monitoring');
        
        if (this.monitoringInterval) {
            window.clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        this.isMonitoring = false;
        console.log('[PerformanceDashboardService] Performance monitoring stopped');
    }

    /**
     * Set up Mountain performance listeners
     */
    private async setupMountainListeners(): Promise<void> {
        try {
            await listen('mountain_performance_update', (event) => {
                this.handleMountainPerformanceUpdate(event.payload);
            });

            await listen('mountain_sync_metrics', (event) => {
                this.handleSyncMetrics(event.payload);
            });

            console.log('[PerformanceDashboardService] Mountain performance listeners setup complete');
        } catch (error) {
            console.error('[PerformanceDashboardService] Failed to setup Mountain listeners:', error);
        }
    }

    /**
     * Collect performance metrics
     */
    private async collectMetrics(): Promise<void> {
        try {
            const metrics: IPerformanceMetrics = {
                cpu: await this.getCpuMetrics(),
                memory: await this.getMemoryMetrics(),
                network: await this.getNetworkMetrics(),
                synchronization: await this.getSyncMetrics(),
                ui: await this.getUIMetrics(),
                timestamp: Date.now()
            };

            this.metrics.push(metrics);
            this.historicalData.set(metrics.timestamp, { ...metrics, interval: 2000 });

            // Check thresholds and trigger alerts
            this.checkThresholds(metrics);

            // Keep only last 1000 metrics
            if (this.metrics.length > 1000) {
                this.metrics = this.metrics.slice(-1000);
            }

            // Keep only last hour of historical data
            const oneHourAgo = Date.now() - 3600000;
            for (const [timestamp] of this.historicalData) {
                if (timestamp < oneHourAgo) {
                    this.historicalData.delete(timestamp);
                }
            }

        } catch (error) {
            console.error('[PerformanceDashboardService] Failed to collect metrics:', error);
        }
    }

    /**
     * Get CPU metrics
     */
    private async getCpuMetrics(): Promise<IPerformanceMetrics['cpu']> {
        try {
            // Get CPU usage from Mountain
            const cpuStats = await invoke<{ usage: number; cores: number; threads: number }>(
                'mountain_get_cpu_stats'
            );
            
            return cpuStats;
        } catch (error) {
            console.warn('[PerformanceDashboardService] Failed to get CPU metrics:', error);
            return {
                usage: 0,
                cores: navigator.hardwareConcurrency || 4,
                threads: navigator.hardwareConcurrency || 4
            };
        }
    }

    /**
     * Get memory metrics
     */
    private async getMemoryMetrics(): Promise<IPerformanceMetrics['memory']> {
        try {
            // Get memory usage from Mountain
            const memoryStats = await invoke<{ used: number; total: number; heap: number }>(
                'mountain_get_memory_stats'
            );
            
            return memoryStats;
        } catch (error) {
            console.warn('[PerformanceDashboardService] Failed to get memory metrics:', error);
            
            // Fallback to browser memory API if available
            const memory = (performance as any).memory;
            return {
                used: memory ? memory.usedJSHeapSize : 0,
                total: memory ? memory.totalJSHeapSize : 0,
                heap: memory ? memory.jsHeapSizeLimit : 0
            };
        }
    }

    /**
     * Get network metrics
     */
    private async getNetworkMetrics(): Promise<IPerformanceMetrics['network']> {
        try {
            // Get network metrics from Mountain
            const networkStats = await invoke<{ latency: number; throughput: number; connections: number }>(
                'mountain_get_network_stats'
            );
            
            return networkStats;
        } catch (error) {
            console.warn('[PerformanceDashboardService] Failed to get network metrics:', error);
            return {
                latency: 0,
                throughput: 0,
                connections: 0
            };
        }
    }

    /**
     * Get synchronization metrics
     */
    private async getSyncMetrics(): Promise<IPerformanceMetrics['synchronization']> {
        try {
            // Get sync metrics from Mountain
            const syncStats = await invoke<{ syncRate: number; conflictRate: number; successRate: number }>(
                'mountain_get_sync_stats'
            );
            
            return syncStats;
        } catch (error) {
            console.warn('[PerformanceDashboardService] Failed to get sync metrics:', error);
            return {
                syncRate: 1,
                conflictRate: 0,
                successRate: 1
            };
        }
    }

    /**
     * Get UI metrics
     */
    private async getUIMetrics(): Promise<IPerformanceMetrics['ui']> {
        return new Promise((resolve) => {
            // Calculate FPS
            let frameCount = 0;
            let lastTime = performance.now();
            
            const measureFrameRate = () => {
                frameCount++;
                const currentTime = performance.now();
                
                if (currentTime - lastTime >= 1000) {
                    const fps = frameCount;
                    frameCount = 0;
                    lastTime = currentTime;
                    
                    resolve({
                        fps,
                        renderTime: 16, // Target 60fps
                        interactionDelay: 50 // Target < 100ms
                    });
                } else {
                    requestAnimationFrame(measureFrameRate);
                }
            };
            
            requestAnimationFrame(measureFrameRate);
        });
    }

    /**
     * Handle Mountain performance updates
     */
    private handleMountainPerformanceUpdate(update: any): void {
        console.debug('[PerformanceDashboardService] Mountain performance update:', update);
        
        // Update metrics with Mountain data
        const currentMetrics = this.metrics[this.metrics.length - 1];
        if (currentMetrics) {
            if (update.cpu) currentMetrics.cpu = { ...currentMetrics.cpu, ...update.cpu };
            if (update.memory) currentMetrics.memory = { ...currentMetrics.memory, ...update.memory };
            if (update.network) currentMetrics.network = { ...currentMetrics.network, ...update.network };
        }
    }

    /**
     * Handle synchronization metrics
     */
    private handleSyncMetrics(metrics: any): void {
        console.debug('[PerformanceDashboardService] Sync metrics:', metrics);
        
        const currentMetrics = this.metrics[this.metrics.length - 1];
        if (currentMetrics && metrics.synchronization) {
            currentMetrics.synchronization = { ...currentMetrics.synchronization, ...metrics.synchronization };
        }
    }

    /**
     * Check performance thresholds
     */
    private checkThresholds(metrics: IPerformanceMetrics): void {
        const alerts: IPerformanceAlert[] = [];

        // Check CPU thresholds
        if (metrics.cpu.usage >= this.thresholds.cpu.critical) {
            alerts.push(this.createAlert('critical', 'cpu.usage', metrics.cpu.usage, this.thresholds.cpu.critical));
        } else if (metrics.cpu.usage >= this.thresholds.cpu.warning) {
            alerts.push(this.createAlert('warning', 'cpu.usage', metrics.cpu.usage, this.thresholds.cpu.warning));
        }

        // Check memory thresholds
        const memoryUsagePercent = (metrics.memory.used / metrics.memory.total) * 100;
        if (memoryUsagePercent >= this.thresholds.memory.critical) {
            alerts.push(this.createAlert('critical', 'memory.usage', memoryUsagePercent, this.thresholds.memory.critical));
        } else if (memoryUsagePercent >= this.thresholds.memory.warning) {
            alerts.push(this.createAlert('warning', 'memory.usage', memoryUsagePercent, this.thresholds.memory.warning));
        }

        // Check network thresholds
        if (metrics.network.latency >= this.thresholds.network.latencyCritical) {
            alerts.push(this.createAlert('critical', 'network.latency', metrics.network.latency, this.thresholds.network.latencyCritical));
        } else if (metrics.network.latency >= this.thresholds.network.latencyWarning) {
            alerts.push(this.createAlert('warning', 'network.latency', metrics.network.latency, this.thresholds.network.latencyWarning));
        }

        // Check sync thresholds
        if (metrics.synchronization.successRate <= this.thresholds.synchronization.successRateWarning) {
            alerts.push(this.createAlert('warning', 'synchronization.successRate', metrics.synchronization.successRate, this.thresholds.synchronization.successRateWarning));
        }

        // Trigger alerts
        alerts.forEach(alert => {
            this.alertCallbacks.forEach(callback => {
                try {
                    callback(alert);
                } catch (error) {
                    console.error('[PerformanceDashboardService] Error in alert callback:', error);
                }
            });
        });
    }

    /**
     * Create performance alert
     */
    private createAlert(type: 'warning' | 'critical' | 'info', metric: string, value: number, threshold: number): IPerformanceAlert {
        return {
            alertId: `${metric}-${Date.now()}`,
            type,
            metric,
            value,
            threshold,
            timestamp: Date.now(),
            description: this.getAlertDescription(type, metric, value, threshold),
            recommendations: this.getAlertRecommendations(type, metric)
        };
    }

    /**
     * Get alert description
     */
    private getAlertDescription(type: string, metric: string, value: number, threshold: number): string {
        const descriptions: Record<string, Record<string, string>> = {
            warning: {
                'cpu.usage': `High CPU usage: ${value.toFixed(1)}% (threshold: ${threshold}%)`,
                'memory.usage': `High memory usage: ${value.toFixed(1)}% (threshold: ${threshold}%)`,
                'network.latency': `High network latency: ${value}ms (threshold: ${threshold}ms)`,
                'synchronization.successRate': `Low sync success rate: ${(value * 100).toFixed(1)}% (threshold: ${(threshold * 100).toFixed(1)}%)`
            },
            critical: {
                'cpu.usage': `Critical CPU usage: ${value.toFixed(1)}% (threshold: ${threshold}%)`,
                'memory.usage': `Critical memory usage: ${value.toFixed(1)}% (threshold: ${threshold}%)`,
                'network.latency': `Critical network latency: ${value}ms (threshold: ${threshold}ms)`
            }
        };

        return descriptions[type]?.[metric] || `${metric} ${type} alert: ${value} exceeds ${threshold}`;
    }

    /**
     * Get alert recommendations
     */
    private getAlertRecommendations(type: string, metric: string): string[] {
        const recommendations: Record<string, Record<string, string[]>> = {
            warning: {
                'cpu.usage': ['Close unused applications', 'Reduce number of open documents', 'Check for background processes'],
                'memory.usage': ['Close unused applications', 'Clear document cache', 'Restart the application'],
                'network.latency': ['Check network connection', 'Move closer to router', 'Reduce network load'],
                'synchronization.successRate': ['Check network connection', 'Reduce document size', 'Increase sync interval']
            },
            critical: {
                'cpu.usage': ['Immediately save work and restart', 'Close all non-essential applications', 'Check for malware'],
                'memory.usage': ['Save work immediately and restart', 'Clear all caches', 'Check for memory leaks'],
                'network.latency': ['Switch to wired connection', 'Restart router', 'Contact network administrator']
            }
        };

        return recommendations[type]?.[metric] || ['Review system performance', 'Consider restarting the application'];
    }

    /**
     * Get current performance metrics
     */
    getPerformanceMetrics(): IPerformanceMetrics {
        return this.metrics[this.metrics.length - 1] || this.getDefaultMetrics();
    }

    /**
     * Get default metrics
     */
    private getDefaultMetrics(): IPerformanceMetrics {
        return {
            cpu: { usage: 0, cores: 4, threads: 4 },
            memory: { used: 0, total: 0, heap: 0 },
            network: { latency: 0, throughput: 0, connections: 0 },
            synchronization: { syncRate: 1, conflictRate: 0, successRate: 1 },
            ui: { fps: 60, renderTime: 16, interactionDelay: 50 },
            timestamp: Date.now()
        };
    }

    /**
     * Get historical data
     */
    getHistoricalData(timeRange: string): IHistoricalMetrics[] {
        const now = Date.now();
        let timeAgo = now;

        switch (timeRange) {
            case '5min':
                timeAgo = now - 300000;
                break;
            case '30min':
                timeAgo = now - 1800000;
                break;
            case '1hour':
                timeAgo = now - 3600000;
                break;
            default:
                timeAgo = now - 3600000; // Default to 1 hour
        }

        return Array.from(this.historicalData.values())
            .filter(metric => metric.timestamp >= timeAgo)
            .sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Set performance thresholds
     */
    setPerformanceThresholds(thresholds: IPerformanceThresholds): void {
        this.thresholds = { ...this.thresholds, ...thresholds };
        console.log('[PerformanceDashboardService] Performance thresholds updated');
    }

    /**
     * Alert on performance issues
     */
    alertOnPerformanceIssues(callback: (alert: IPerformanceAlert) => void): void {
        this.alertCallbacks.add(callback);
    }

    /**
     * Remove performance alert callback
     */
    removeAlertCallback(callback: (alert: IPerformanceAlert) => void): void {
        this.alertCallbacks.delete(callback);
    }

    /**
     * Get monitoring status
     */
    isMonitoringActive(): boolean {
        return this.isMonitoring;
    }

    /**
     * Get current thresholds
     */
    getCurrentThresholds(): IPerformanceThresholds {
        return this.thresholds;
    }
}

// Export singleton instance
export const performanceDashboardService = PerformanceDashboardService.getInstance();
