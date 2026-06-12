/**
 * @module Effect/Telemetry/Layer/TelemetryLive
 * @description
 * Live layer for Telemetry service - plain Map state, zero Effect-TS runtime overhead.
 * @category Layer
 */

import type { TelemetryService } from "../Interface/TelemetryService.js";
import type {
	SpanHandle,
	TelemetryEvent,
	TelemetryLog,
	TelemetryMetric,
	TelemetrySpan,
} from "../Type/TelemetryType.js";

function makeTelemetryService(): TelemetryService {
	const _metrics = new Map<string, TelemetryMetric[]>();
	const _spans = new Map<string, TelemetrySpan[]>();
	let _events: TelemetryEvent[] = [];
	const _eventsListeners: ((v: ReadonlyArray<TelemetryEvent>) => void)[] = [];

	const recordMetric = async (
		name: string,
		value: number,
		labels?: Record<string, string>,
	): Promise<void> => {
		const metric: TelemetryMetric = {
			name,
			value,
			timestamp: Date.now(),
			labels: labels ?? ({} as Readonly<Record<string, string>>),
		};
		const existing = _metrics.get(name) ?? [];
		_metrics.set(name, [...existing, metric].slice(-1000));
		_events = [
			..._events,
			{
				type: "metric" as const,
				timestamp: Date.now(),
				data: metric,
			},
		].slice(-10000);
		_eventsListeners.forEach((fn) => fn(_events));
	};

	const startSpan = async (
		name: string,
		labels?: Record<string, string>,
	): Promise<SpanHandle> => {
		const startTime = Date.now();
		const end = async (success: boolean, error?: string): Promise<void> => {
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
			const existing = _spans.get(name) ?? [];
			_spans.set(name, [...existing, span].slice(-1000));
			_events = [
				..._events,
				{
					type: "span" as const,
					timestamp: Date.now(),
					data: span,
				},
			].slice(-10000);
			_eventsListeners.forEach((fn) => fn(_events));
		};
		return { end };
	};

	const log = async (
		level: TelemetryLog["level"],
		message: string,
		context?: Record<string, unknown>,
	): Promise<void> => {
		const entry: TelemetryLog = {
			level,
			message,
			context: context ?? {},
		};
		_events = [
			..._events,
			{ type: "log" as const, timestamp: Date.now(), data: entry },
		].slice(-10000);
		_eventsListeners.forEach((fn) => fn(_events));
		if (typeof performance !== "undefined") {
			try {
				performance.mark(
					`land:telemetry:${level}:${message.slice(0, 80)}`,
				);
			} catch {}
		}
	};

	const events: ReadableStream<ReadonlyArray<TelemetryEvent>> = new ReadableStream({
		start(controller) {
			const fn = (v: ReadonlyArray<TelemetryEvent>) => {
				controller.enqueue(v);
			};
			_eventsListeners.push(fn);
		},
	});

	const getMetrics = async (
		name: string,
	): Promise<ReadonlyArray<TelemetryMetric>> =>
		_metrics.get(name) ?? [];

	const getAverageDuration = async (name: string): Promise<number> => {
		const spans = _spans.get(name) ?? [];
		if (spans.length === 0) return 0;
		return (
			spans.reduce((sum, s) => sum + (s.duration || 0), 0) /
			spans.length
		);
	};

	const getSuccessRate = async (name: string): Promise<number> => {
		const spans = _spans.get(name) ?? [];
		if (spans.length === 0) return 0;
		return spans.filter((s) => s.success).length / spans.length;
	};

	return {
		recordMetric,
		startSpan,
		log,
		events,
		getMetrics,
		getAverageDuration,
		getSuccessRate,
		flush: Promise.resolve(),
	};
}

const TelemetryLive = makeTelemetryService();

export default TelemetryLive;
