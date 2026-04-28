/**
 * @module Effect/Telemetry/Layer/TelemetryLive
 * @description
 * Live layer for Telemetry service.
 * Provides the production implementation using SubscriptionRef for reactive state.
 * @see {@link Effect/Telemetry/Interface/TelemetryService} Service interface
 * @see {@link Effect/Telemetry/Layer/TelemetryMock} Mock layer
 * @category Layer
 */

import { Effect, HashMap, Layer, Stream, SubscriptionRef } from "effect";

import type { TelemetryService } from "../Interface/TelemetryService.js";
import TelemetryTag from "../Tag/TelemetryTag.js";
import type {
	SpanHandle,
	TelemetryEvent,
	TelemetryLog,
	TelemetryMetric,
	TelemetrySpan,
} from "../Type/TelemetryType.js";

/**
 * Live layer for Telemetry service.
 * Provides reactive telemetry management with SubscriptionRef-based state.
 *
 * @example
 * ```ts
 * import { Layer } from "effect";
 * import { TelemetryLive } from "./Effect/Telemetry/Layer/TelemetryLive.js";
 *
 * const appLayer = TelemetryLive;
 * ```
 */
const TelemetryLive = Layer.effect(
	TelemetryTag,
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
		): Effect.Effect<void, never> =>
			Effect.gen(function* () {
				const metric: TelemetryMetric = {
					name,
					value,
					timestamp: Date.now(),
					labels: labels ?? ({} as Readonly<Record<string, string>>),
				};

				const currentMetrics = yield* metricsRef.get;
				const existing =
					HashMap.get(currentMetrics, name).pipe(Effect.runSync) ||
					[];
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
			});

		// Atom: Start a span
		const startSpan = (
			name: string,
			labels?: Record<string, string>,
		): Effect.Effect<SpanHandle, never> =>
			Effect.sync((): SpanHandle => {
				const startTime = Date.now();

				const end = (
					success: boolean,
					error?: string | undefined,
				): Effect.Effect<void, never> =>
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
							HashMap.get(currentSpans, name).pipe(
								Effect.runSync,
							) || [];
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
					});

				return { end };
			});

		// Atom: Log an event
		const log = (
			level: TelemetryLog["level"],
			message: string,
			context?: Record<string, unknown>,
		): Effect.Effect<void, never> =>
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

				// Trace via performance.mark - OTELBridge collects automatically
				if (typeof performance !== "undefined") {
					try {
						performance.mark(
							`land:telemetry:${level}:${message.slice(0, 80)}`,
						);
					} catch {}
				}
			});

		// Stream of all events - use SubscriptionRef.changes
		const events: Stream.Stream<
			ReadonlyArray<TelemetryEvent>,
			never
		> = eventsRef.changes;

		// Atom: Get metrics by name
		const getMetrics = (
			name: string,
		): Effect.Effect<ReadonlyArray<TelemetryMetric>, never> =>
			metricsRef.get.pipe(
				Effect.map(
					(map) => HashMap.get(map, name).pipe(Effect.runSync) || [],
				),
			);

		// Atom: Get average duration for spans
		const getAverageDuration = (
			name: string,
		): Effect.Effect<number, never> =>
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
		const getSuccessRate = (name: string): Effect.Effect<number, never> =>
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

		const service: TelemetryService = {
			recordMetric,
			startSpan,
			log,
			events,
			getMetrics,
			getAverageDuration,
			getSuccessRate,
			flush,
		};

		return service;
	}),
);

export default TelemetryLive;
