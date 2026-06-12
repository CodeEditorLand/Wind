/**
 * @module Effect/Telemetry/Helper/withSpan
 * @description
 * Helper function to wrap a promise with automatic span tracking.
 * Creates a span before the operation and ends it after completion, recording success/failure.
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @see {@link Effect/Telemetry/Helper/withMetric} Metric helper
 * @category Helper
 */

import TelemetryLive from "../Layer/TelemetryLive.js";

/**
 * Wraps an async operation with automatic span tracking.
 * Creates a span before the operation, tracks its duration, and records success/failure.
 *
 * @param name - Name of the operation being tracked
 * @param fn - The async function to wrap
 * @param labels - Optional labels to attach to the span
 * @returns The wrapped async function with automatic span tracking
 */
export default async function withSpan<T>(
	name: string,
	fn: () => Promise<T>,
	labels?: Record<string, string>,
): Promise<T> {
	const span = await TelemetryLive.startSpan(name, labels);

	try {
		const result = await fn();
		await span.end(true);
		return result;
	} catch (error) {
		await span.end(false, String(error));
		throw error;
	}
}
