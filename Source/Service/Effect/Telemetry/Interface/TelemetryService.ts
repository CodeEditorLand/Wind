/**
 * @module Effect/Telemetry/Interface/TelemetryService
 * @description
 * Service interface for Telemetry management.
 * Provides methods for metrics, spans, and logging with stream-based reactivity.
 * @see {@link Effect/Telemetry/Type/TelemetryType} Type definitions
 * @see {@link Effect/Telemetry/Layer/TelemetryLive} Live implementation
 * @category Interface
 */

import type {
	SpanHandle,
	TelemetryEvent,
	TelemetryLog,
	TelemetryMetric,
} from "../Type/TelemetryType.js";

/**
 * Telemetry service interface for unified monitoring and logging.
 * Provides metrics recording, span tracking, and comprehensive logging capabilities.
 */
export interface TelemetryService {
	/** Record a metric value with optional labels */
	readonly recordMetric: (
		name: string,

		value: number,

		labels?: Record<string, string>,
	) => Promise<void>;

	/** Start a timed span and return a handle for ending it */
	readonly startSpan: (
		name: string,

		labels?: Record<string, string>,
	) => Promise<SpanHandle>;

	/** Log an event at the specified level */
	readonly log: (
		level: TelemetryLog["level"],

		message: string,

		context?: Record<string, unknown>,
	) => Promise<void>;

	/** Stream of all telemetry events for reactive updates */
	readonly events: ReadableStream<ReadonlyArray<TelemetryEvent>>;

	/** Get all metrics recorded for a specific name */
	readonly getMetrics: (
		name: string,
	) => Promise<ReadonlyArray<TelemetryMetric>>;

	/** Get average duration for spans with the given name */
	readonly getAverageDuration: (name: string) => Promise<number>;

	/** Get success rate for spans with the given name */
	readonly getSuccessRate: (name: string) => Promise<number>;

	/** Flush/clear all telemetry data */
	readonly flush: Promise<void>;
}
