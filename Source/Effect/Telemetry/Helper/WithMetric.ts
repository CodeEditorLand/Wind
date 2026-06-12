/**
 * @module Effect/Telemetry/Helper/withMetric
 * @description
 * Helper function to record metrics from an async operation execution.
 * Records the duration as a metric and logs failures.
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @see {@link Effect/Telemetry/Helper/withSpan} Span helper
 * @category Helper
 */

import TelemetryLive from "../Layer/TelemetryLive.js";

/**
 * Wraps an async operation with automatic metric recording.
 * Records the execution duration as a metric and logs any failures.
 *
 * @param name - Base name for the metric (formatted as `{name}_duration`)
 * @param fn - The async function to wrap
 * @param labels - Optional labels to attach to the metric
 * @returns The wrapped async function with automatic metric recording
 */
export default async function withMetric<T>(
	name: string,
	fn: () => Promise<T>,
	labels?: Record<string, string>,
): Promise<T> {
	const startTime = Date.now();

	try {
		const result = await fn();
		await TelemetryLive.recordMetric(
			`${name}_duration`,
			Date.now() - startTime,
			labels,
		);
		return result;
	} catch (error) {
		await TelemetryLive.log("error", `${name} failed`, {
			error: String(error),
		});
		throw error;
	}
}
