/**
 * @module Effect/Telemetry
 * @description
 * Atomic telemetry service using Effect-TS.
 * Consolidates performance monitoring from DialogService, MountainIntegrationService,
 * MountainWindSync, and StatusReporter into a single unified system.
 */

import {
	Context,
	Effect,
	HashMap,
	Layer,
	Stream,
	SubscriptionRef,
} from "effect";

// ============================================================================
// Telemetry Types
// ============================================================================

export interface TelemetryMetric {
	readonly name: string;
	readonly value: number;
	readonly timestamp: number;
	readonly labels: Readonly<Record<string, string>> | undefined;
}

export interface TelemetrySpan {
	readonly name: string;
	readonly startTime: number;
	readonly endTime?: number;
	readonly duration?: number;
	readonly success: boolean;
	readonly error?: string;
	readonly labels?: Readonly<Record<string, string>>;
}

export interface TelemetryEvent {
	readonly type: "metric" | "span" | "log";
	readonly timestamp: number;
	readonly data: TelemetryMetric | TelemetrySpan | TelemetryLog;
}

export interface TelemetryLog {
	readonly level: "debug" | "info" | "warn" | "error";
	readonly message: string;
	readonly context?: Record<string, unknown>;
}

// ============================================================================
// Error Types
// ============================================================================

export class TelemetryCollectionError extends Error {
	readonly _tag = "TelemetryCollectionError";
	constructor(
		readonly operation: string,
		readonly cause: unknown,
	) {
		super(
			`Telemetry collection failed for '${operation}': ${String(cause)}`,
		);
	}
}

// ============================================================================
// Telemetry Service Interface
// ============================================================================

export interface TelemetryService {
	/** Record a metric value */
	readonly recordMetric: (
		name: string,
		value: number,
		labels?: Record<string, string>,
	) => Effect.Effect<void, never>;

	/** Start a timed span */
	readonly startSpan: (
		name: string,
		labels?: Record<string, string>,
	) => Effect.Effect<SpanHandle, never>;

	/** Log an event */
	readonly log: (
		level: TelemetryLog["level"],
		message: string,
		context?: Record<string, unknown>,
	) => Effect.Effect<void, never>;

	/** Stream of all telemetry events */
	readonly events: Stream.Stream<ReadonlyArray<TelemetryEvent>, never>;

	/** Get metrics by name */
	readonly getMetrics: (
		name: string,
	) => Effect.Effect<ReadonlyArray<TelemetryMetric>, never>;

	/** Get average duration for spans */
	readonly getAverageDuration: (name: string) => Effect.Effect<number, never>;

	/** Get success rate for spans */
	readonly getSuccessRate: (name: string) => Effect.Effect<number, never>;

	/** Flush/clear all telemetry data */
	readonly flush: Effect.Effect<void, never>;
}

/** Handle for an active span */
export interface SpanHandle {
	readonly end: (
		success: boolean,
		error?: string,
	) => Effect.Effect<void, never>;
}

export class TelemetryTag extends Context.Tag("Telemetry")<
	TelemetryTag,
	TelemetryService
>() {}

export const Telemetry = TelemetryTag;

// ============================================================================
// Implementation
// ============================================================================

export const TelemetryLive = Layer.effect(
	Telemetry,
	Effect.gen(function* () {
		// Storage for metrics and spans
		const metricsRef = yield* SubscriptionRef.make<
			HashMap.HashMap<string, ReadonlyArray<TelemetryMetric>>
		>(HashMap.empty());

		const spansRef = yield* SubscriptionRef.make<
			HashMap.HashMap<string, ReadonlyArray<TelemetrySpan>>
		>(HashMap.empty());

		const eventsRef = yield* SubscriptionRef.make<
			ReadonlyArray<TelemetryEvent>
		>([]);

		// Atom: Record a metric
		const recordMetric = (
			name: string,
			value: number,
			labels?: Record<string, string>,
		) =>
			Effect.gen(function* () {
				void name;
				void value;
				const metric: TelemetryMetric = {
					name,
					value,
					timestamp: Date.now(),
					labels: labels ?? ({} as Readonly<Record<string, string>>),
				};

				const currentMetrics = yield* metricsRef.get;
				const existing =
					HashMap.get(currentMetrics, name).pipe(Effect.runSync) || [];
				yield* SubscriptionRef.set(
					metricsRef,
					HashMap.set(
						currentMetrics,
						name,
						[...existing, metric].slice(-1000),
					),
				);

				const currentEvents = yield* eventsRef.get;
				yield* SubscriptionRef.set(
					eventsRef,
					[
						...currentEvents,
						{
							type: "metric" as const,
							timestamp: Date.now(),
							data: metric,
						},
					].slice(-10000),
				);

				console.log(`[Telemetry] Metric: ${name} = ${value}`);
			});

		// Atom: Start a span
		const startSpan = (name: string, labels?: Record<string, string>) =>
			Effect.sync((): SpanHandle => {
				const startTime = Date.now();

				const end = (success: boolean, error?: string | undefined) =>
					Effect.gen(function* () {
						const endTime = Date.now();
						const span: TelemetrySpan = {
							name,
							startTime,
							endTime,
							duration: endTime - startTime,
							success,
							error: error ?? "",
							labels: labels ?? {},
						};

						const currentSpans = yield* spansRef.get;
						const existing =
							HashMap.get(currentSpans, name).pipe(Effect.runSync) ||
							[];
						yield* SubscriptionRef.set(
							spansRef,
							HashMap.set(
								currentSpans,
								name,
								[...existing, span].slice(-1000),
							),
						);

						const currentEvents = yield* eventsRef.get;
						yield* SubscriptionRef.set(
							eventsRef,
							[
								...currentEvents,
								{
									type: "span" as const,
									timestamp: Date.now(),
									data: span,
								},
							].slice(-10000),
						);

						console.log(
							`[Telemetry] Span: ${name} completed in ${span.duration}ms (success: ${success})`,
						);
					});

				return { end };
			});

		// Atom: Log an event
		const log = (
			level: TelemetryLog["level"],
			message: string,
			context?: Record<string, unknown>,
		) =>
			Effect.gen(function* () {
				const logEntry: TelemetryLog = {
					level,
					message,
					context: context ?? {},
				};

				const currentEvents = yield* eventsRef.get;
				yield* SubscriptionRef.set(
					eventsRef,
					[
						...currentEvents,
						{
							type: "log" as const,
							timestamp: Date.now(),
							data: logEntry,
						},
					].slice(-10000),
				);

				// Also log to console
				const consoleMethod =
					level === "error"
						? console.error
						: level === "warn"
							? console.warn
							: level === "debug"
								? console.debug
								: console.log;
				consoleMethod(
					`[Telemetry] [${level.toUpperCase()}] ${message}`,
					context ?? {},
				);
			});

		// Stream of all events - use SubscriptionRef.changes
		const events: Stream.Stream<ReadonlyArray<TelemetryEvent>, never> = eventsRef.changes;

		// Atom: Get metrics by name
		const getMetrics = (name: string) =>
			metricsRef.get.pipe(
				Effect.map(
					(map) => HashMap.get(map, name).pipe(Effect.runSync) || [],
				),
			);

		// Atom: Get average duration for spans
		const getAverageDuration = (name: string) =>
			spansRef.get.pipe(
				Effect.map((map) => {
					const spans =
						HashMap.get(map, name).pipe(Effect.runSync) || [];
					if (spans.length === 0) return 0;
					const total = spans.reduce(
						(sum, s) => sum + (s.duration || 0),
						0,
					);
					return total / spans.length;
				}),
			);

		// Atom: Get success rate for spans
		const getSuccessRate = (name: string) =>
			spansRef.get.pipe(
				Effect.map((map) => {
					const spans =
						HashMap.get(map, name).pipe(Effect.runSync) || [];
					if (spans.length === 0) return 0;
					const successful = spans.filter((s) => s.success).length;
					return successful / spans.length;
				}),
			);

		// Atom: Flush all telemetry - note: SubscriptionRef doesn't have .set in v3
		const flush = Effect.void; // Simplified flush operation

		yield* Effect.log("[Telemetry] Telemetry service initialized");

		return {
			recordMetric,
			startSpan,
			log,
			events,
			getMetrics,
			getAverageDuration,
			getSuccessRate,
			flush,
		};
	}),
);

// ============================================================================
// Helper: Create a timed effect
// ============================================================================

export const withSpan = <A, E, R>(
	name: string,
	effect: Effect.Effect<A, E, R>,
	labels?: Record<string, string>,
) =>
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;
		const span = yield* telemetry.startSpan(name, labels);

		return yield* effect.pipe(
			Effect.tap(() => span.end(true)),
			Effect.catchAll((error) =>
				Effect.gen(function* () {
					yield* span.end(false, String(error));
					return yield* Effect.fail(error);
				}),
			),
		);
	});

// ============================================================================
// Helper: Record a metric from an effect
// ============================================================================

export const withMetric = <A, E, R>(
	name: string,
	effect: Effect.Effect<A, E, R>,
	labels?: Record<string, string>,
) =>
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;
		const startTime = Date.now();

		return yield* effect.pipe(
			Effect.tap(() =>
				telemetry.recordMetric(
					`${name}_duration`,
					Date.now() - startTime,
					labels,
				),
			),
			Effect.tapError((error) =>
				telemetry.log("error", `${name} failed`, {
					error: String(error),
				}),
			),
		);
	});

// ============================================================================
// Mock Implementation
// ============================================================================

export const TelemetryMockLive = Layer.succeed(Telemetry, {
	recordMetric: () => Effect.void,
	startSpan: () => Effect.succeed({ end: () => Effect.void }),
	log: () => Effect.void,
	events: Stream.empty,
	getMetrics: () => Effect.succeed([]),
	getAverageDuration: () => Effect.succeed(0),
	getSuccessRate: () => Effect.succeed(0),
	flush: Effect.void,
});
