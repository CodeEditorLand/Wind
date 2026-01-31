/**
 * @module Bootstrap/Utils/Performance
 * @description
 * Performance tracking utilities for bootstrap stages.
 */

export class PerformanceTracker {
	private static instance: PerformanceTracker;
	private measurements: Map<
		string,
		{
			startTime: number;
			endTime?: number;
			duration?: number;
			data?: any;
		}
	> = new Map();

	private constructor() {}

	/**
	 * Get the singleton instance
	 */
	static getInstance(): PerformanceTracker {
		if (!PerformanceTracker.instance) {
			PerformanceTracker.instance = new PerformanceTracker();
		}
		return PerformanceTracker.instance;
	}

	/**
	 * Start measuring performance
	 */
	start(name: string, data?: any): void {
		this.measurements.set(name, {
			startTime: performance.now(),
			data,
		});

		console.log(`[Performance] Started: ${name}`);
	}

	/**
	 * End measuring performance
	 */
	end(name: string): number {
		const measurement = this.measurements.get(name);

		if (!measurement) {
			console.warn(`[Performance] No measurement found for: ${name}`);
			return 0;
		}

		const endTime = performance.now();
		const duration = endTime - measurement.startTime;

		measurement.endTime = endTime;
		measurement.duration = duration;

		this.measurements.set(name, measurement);

		console.log(
			`[Performance] Completed: ${name} (${duration.toFixed(2)}ms)`,
		);

		return duration;
	}

	/**
	 * Get measurement result
	 */
	get(name: string):
		| {
				startTime: number;
				endTime?: number;
				duration?: number;
				data?: any;
		  }
		| undefined {
		return this.measurements.get(name);
	}

	/**
	 * Get all measurements
	 */
	getAll(): Map<
		string,
		{
			startTime: number;
			endTime?: number;
			duration?: number;
			data?: any;
		}
	> {
		return new Map(this.measurements);
	}

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
	} {
		const completedMeasurements = Array.from(this.measurements.entries())
			.filter(([_, m]) => m.duration !== undefined)
			.map(([name, m]) => ({
				name,
				duration: m.duration!,
				percentage: 0,
			}));

		const totalDuration = completedMeasurements.reduce(
			(sum, m) => sum + m.duration,
			0,
		);

		// Calculate percentages
		completedMeasurements.forEach((m) => {
			m.percentage = (m.duration / totalDuration) * 100;
		});

		// Sort by duration
		completedMeasurements.sort((a, b) => a.duration - b.duration);

		return {
			totalDuration,
			averageDuration:
				completedMeasurements.length > 0
					? totalDuration / completedMeasurements.length
					: 0,
			fastest: completedMeasurements[0]?.name || "none",
			slowest:
				completedMeasurements[completedMeasurements.length - 1]?.name ||
				"none",
			measurements: completedMeasurements,
		};
	}

	/**
	 * Export measurements as JSON
	 */
	export(): string {
		const summary = this.getSummary();

		const data = {
			timestamp: new Date().toISOString(),
			summary,
			measurements: Object.fromEntries(this.measurements),
		};

		return JSON.stringify(data, null, 2);
	}

	/**
	 * Clear all measurements
	 */
	clear(): void {
		this.measurements.clear();
		console.log("[Performance] Cleared all measurements");
	}

	/**
	 * Create a performance marker
	 */
	mark(name: string): void {
		performance.mark(name);
		console.log(`[Performance] Mark: ${name}`);
	}

	/**
	 * Measure between two marks
	 */
	measure(
		name: string,
		startMark: string,
		endMark: string,
	): PerformanceEntry | undefined {
		try {
			performance.measure(name, startMark, endMark);
			const entry = performance.getEntriesByName(name)[0];

			console.log(
				`[Performance] Measure: ${name} (${entry.duration.toFixed(2)}ms)`,
			);

			return entry;
		} catch (error) {
			console.warn(`[Performance] Failed to measure: ${name}`, error);
			return undefined;
		}
	}

	/**
	 * Get memory usage
	 */
	getMemoryUsage(): {
		usedJSHeapSize?: number;
		totalJSHeapSize?: number;
		jsHeapSizeLimit?: number;
	} {
		if ("memory" in performance) {
			return (performance as any).memory;
		}

		return {};
	}

	/**
	 * Get navigation timing
	 */
	getNavigationTiming(): PerformanceNavigationTiming | undefined {
		const entries = performance.getEntriesByType("navigation");
		return entries.length > 0
			? (entries[0] as PerformanceNavigationTiming)
			: undefined;
	}

	/**
	 * Get resource timing
	 */
	getResourceTiming(): PerformanceResourceTiming[] {
		return performance.getEntriesByType(
			"resource",
		) as PerformanceResourceTiming[];
	}

	/**
	 * Print detailed performance report
	 */
	printReport(): void {
		const summary = this.getSummary();
		const memory = this.getMemoryUsage();
		const navigation = this.getNavigationTiming();

		console.group("[Performance] Detailed Report");

		console.log("=== Summary ===");
		console.log(`Total Duration: ${summary.totalDuration.toFixed(2)}ms`);
		console.log(
			`Average Duration: ${summary.averageDuration.toFixed(2)}ms`,
		);
		console.log(`Fastest: ${summary.fastest}`);
		console.log(`Slowest: ${summary.slowest}`);

		console.log("\n=== Measurements ===");
		summary.measurements.forEach((m) => {
			console.log(
				`${m.name}: ${m.duration.toFixed(2)}ms (${m.percentage.toFixed(1)}%)`,
			);
		});

		console.log("\n=== Memory Usage ===");
		if (memory.usedJSHeapSize) {
			console.log(
				`Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
			);
			console.log(
				`Total: ${(memory.totalJSHeapSize! / 1024 / 1024).toFixed(2)}MB`,
			);
			console.log(
				`Limit: ${(memory.jsHeapSizeLimit! / 1024 / 1024).toFixed(2)}MB`,
			);
		} else {
			console.log("Memory API not available");
		}

		console.log("\n=== Navigation Timing ===");
		if (navigation) {
			console.log(
				`DOM Content Loaded: ${navigation.domContentLoadedEventEnd! - navigation.navigationStart!}ms`,
			);
			console.log(
				`Load Complete: ${navigation.loadEventEnd! - navigation.navigationStart!}ms`,
			);
		} else {
			console.log("Navigation timing not available");
		}

		console.groupEnd();
	}
}
