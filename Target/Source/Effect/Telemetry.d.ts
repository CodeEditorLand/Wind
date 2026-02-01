/**
 * @module Effect/Telemetry
 * @description
 * Atomic telemetry service using Effect-TS.
 * Consolidates performance monitoring from DialogService, MountainIntegrationService,
 * MountainWindSync, and StatusReporter into a single unified system.
 */
import { Context, Effect, Layer, Stream } from "effect";
export interface TelemetryMetric {
    readonly name: string;
    readonly value: number;
    readonly timestamp: number;
    readonly labels?: Readonly<Record<string, string>>;
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
export declare class TelemetryCollectionError extends Error {
    readonly operation: string;
    readonly cause: unknown;
    readonly _tag = "TelemetryCollectionError";
    constructor(operation: string, cause: unknown);
}
export interface TelemetryService {
    /** Record a metric value */
    readonly recordMetric: (name: string, value: number, labels?: Record<string, string>) => Effect.Effect<void, never>;
    /** Start a timed span */
    readonly startSpan: (name: string, labels?: Record<string, string>) => Effect.Effect<SpanHandle, never>;
    /** Log an event */
    readonly log: (level: TelemetryLog["level"], message: string, context?: Record<string, unknown>) => Effect.Effect<void, never>;
    /** Stream of all telemetry events */
    readonly events: Stream.Stream<TelemetryEvent, never>;
    /** Get metrics by name */
    readonly getMetrics: (name: string) => Effect.Effect<ReadonlyArray<TelemetryMetric>, never>;
    /** Get average duration for spans */
    readonly getAverageDuration: (name: string) => Effect.Effect<number, never>;
    /** Get success rate for spans */
    readonly getSuccessRate: (name: string) => Effect.Effect<number, never>;
    /** Flush/clear all telemetry data */
    readonly flush: Effect.Effect<void, never>;
}
/** Handle for an active span */
export interface SpanHandle {
    readonly end: (success: boolean, error?: string) => Effect.Effect<void, never>;
}
export declare const Telemetry: Context.Tag<TelemetryService, TelemetryService>;
export declare const TelemetryLive: Layer.Layer<TelemetryService, never, never>;
export declare const withSpan: <A, E, R>(name: string, effect: Effect.Effect<A, E, R>, labels?: Record<string, string>) => Effect.Effect<A, E, R | Telemetry>;
export declare const withMetric: <A, E, R>(name: string, effect: Effect.Effect<A, E, R>, labels?: Record<string, string>) => Effect.Effect<A, E, R | Telemetry>;
export declare const TelemetryMockLive: Layer.Layer<TelemetryService, never, never>;
//# sourceMappingURL=Telemetry.d.ts.map