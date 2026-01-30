/**
 * @module Bootstrap/Utils/Performance
 * @description
 * Performance tracking utilities for bootstrap stages.
 */
export declare class PerformanceTracker {
    private static instance;
    private measurements;
    private constructor();
    /**
     * Get the singleton instance
     */
    static getInstance(): PerformanceTracker;
    /**
     * Start measuring performance
     */
    start(name: string, data?: any): void;
    /**
     * End measuring performance
     */
    end(name: string): number;
    /**
     * Get measurement result
     */
    get(name: string): {
        startTime: number;
        endTime?: number;
        duration?: number;
        data?: any;
    } | undefined;
    /**
     * Get all measurements
     */
    getAll(): Map<string, {
        startTime: number;
        endTime?: number;
        duration?: number;
        data?: any;
    }>;
    /**
     * Get summary statistics
     */
    getSummary(): {
        totalDuration: number;
        averageDuration: number;
        fastest: string;
        slowest: string;
        measurements: Array<{
            name: string;
            duration: number;
            percentage: number;
        }>;
    };
    /**
     * Export measurements as JSON
     */
    export(): string;
    /**
     * Clear all measurements
     */
    clear(): void;
    /**
     * Create a performance marker
     */
    mark(name: string): void;
    /**
     * Measure between two marks
     */
    measure(name: string, startMark: string, endMark: string): PerformanceEntry | undefined;
    /**
     * Get memory usage
     */
    getMemoryUsage(): {
        usedJSHeapSize?: number;
        totalJSHeapSize?: number;
        jsHeapSizeLimit?: number;
    };
    /**
     * Get navigation timing
     */
    getNavigationTiming(): PerformanceNavigationTiming | undefined;
    /**
     * Get resource timing
     */
    getResourceTiming(): PerformanceResourceTiming[];
    /**
     * Print detailed performance report
     */
    printReport(): void;
}
//# sourceMappingURL=Performance.d.ts.map