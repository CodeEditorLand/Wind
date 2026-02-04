var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  Context,
  Effect,
  HashMap,
  Layer,
  Stream,
  SubscriptionRef
} from "effect";
class TelemetryCollectionError extends Error {
  constructor(operation, cause) {
    super(
      `Telemetry collection failed for '${operation}': ${String(cause)}`
    );
    this.operation = operation;
    this.cause = cause;
  }
  static {
    __name(this, "TelemetryCollectionError");
  }
  _tag = "TelemetryCollectionError";
}
class TelemetryTag extends Context.Tag("Telemetry")() {
  static {
    __name(this, "TelemetryTag");
  }
}
const Telemetry = TelemetryTag;
const TelemetryLive = Layer.effect(
  Telemetry,
  Effect.gen(function* () {
    const metricsRef = yield* SubscriptionRef.make(HashMap.empty());
    const spansRef = yield* SubscriptionRef.make(HashMap.empty());
    const eventsRef = yield* SubscriptionRef.make([]);
    const recordMetric = /* @__PURE__ */ __name((name, value, labels) => Effect.gen(function* () {
      void name;
      void value;
      const metric = {
        name,
        value,
        timestamp: Date.now(),
        labels: labels ?? {}
      };
      const currentMetrics = yield* metricsRef.get;
      const existing = HashMap.get(currentMetrics, name).pipe(Effect.runSync) || [];
      yield* SubscriptionRef.set(
        metricsRef,
        HashMap.set(
          currentMetrics,
          name,
          [...existing, metric].slice(-1e3)
        )
      );
      const currentEvents = yield* eventsRef.get;
      yield* SubscriptionRef.set(
        eventsRef,
        [
          ...currentEvents,
          {
            type: "metric",
            timestamp: Date.now(),
            data: metric
          }
        ].slice(-1e4)
      );
      console.log(`[Telemetry] Metric: ${name} = ${value}`);
    }), "recordMetric");
    const startSpan = /* @__PURE__ */ __name((name, labels) => Effect.sync(() => {
      const startTime = Date.now();
      const end = /* @__PURE__ */ __name((success, error) => Effect.gen(function* () {
        const endTime = Date.now();
        const span = {
          name,
          startTime,
          endTime,
          duration: endTime - startTime,
          success,
          error: error ?? "",
          labels: labels ?? {}
        };
        const currentSpans = yield* spansRef.get;
        const existing = HashMap.get(currentSpans, name).pipe(Effect.runSync) || [];
        yield* SubscriptionRef.set(
          spansRef,
          HashMap.set(
            currentSpans,
            name,
            [...existing, span].slice(-1e3)
          )
        );
        const currentEvents = yield* eventsRef.get;
        yield* SubscriptionRef.set(
          eventsRef,
          [
            ...currentEvents,
            {
              type: "span",
              timestamp: Date.now(),
              data: span
            }
          ].slice(-1e4)
        );
        console.log(
          `[Telemetry] Span: ${name} completed in ${span.duration}ms (success: ${success})`
        );
      }), "end");
      return { end };
    }), "startSpan");
    const log = /* @__PURE__ */ __name((level, message, context) => Effect.gen(function* () {
      const logEntry = {
        level,
        message,
        context: context ?? {}
      };
      const currentEvents = yield* eventsRef.get;
      yield* SubscriptionRef.set(
        eventsRef,
        [
          ...currentEvents,
          {
            type: "log",
            timestamp: Date.now(),
            data: logEntry
          }
        ].slice(-1e4)
      );
      const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : level === "debug" ? console.debug : console.log;
      consoleMethod(
        `[Telemetry] [${level.toUpperCase()}] ${message}`,
        context ?? {}
      );
    }), "log");
    const events = eventsRef.changes;
    const getMetrics = /* @__PURE__ */ __name((name) => metricsRef.get.pipe(
      Effect.map(
        (map) => HashMap.get(map, name).pipe(Effect.runSync) || []
      )
    ), "getMetrics");
    const getAverageDuration = /* @__PURE__ */ __name((name) => spansRef.get.pipe(
      Effect.map((map) => {
        const spans = HashMap.get(map, name).pipe(Effect.runSync) || [];
        if (spans.length === 0) return 0;
        const total = spans.reduce(
          (sum, s) => sum + (s.duration || 0),
          0
        );
        return total / spans.length;
      })
    ), "getAverageDuration");
    const getSuccessRate = /* @__PURE__ */ __name((name) => spansRef.get.pipe(
      Effect.map((map) => {
        const spans = HashMap.get(map, name).pipe(Effect.runSync) || [];
        if (spans.length === 0) return 0;
        const successful = spans.filter((s) => s.success).length;
        return successful / spans.length;
      })
    ), "getSuccessRate");
    const flush = Effect.void;
    yield* Effect.log("[Telemetry] Telemetry service initialized");
    return {
      recordMetric,
      startSpan,
      log,
      events,
      getMetrics,
      getAverageDuration,
      getSuccessRate,
      flush
    };
  })
);
const withSpan = /* @__PURE__ */ __name((name, effect, labels) => Effect.gen(function* () {
  const telemetry = yield* Telemetry;
  const span = yield* telemetry.startSpan(name, labels);
  return yield* effect.pipe(
    Effect.tap(() => span.end(true)),
    Effect.catchAll(
      (error) => Effect.gen(function* () {
        yield* span.end(false, String(error));
        return yield* Effect.fail(error);
      })
    )
  );
}), "withSpan");
const withMetric = /* @__PURE__ */ __name((name, effect, labels) => Effect.gen(function* () {
  const telemetry = yield* Telemetry;
  const startTime = Date.now();
  return yield* effect.pipe(
    Effect.tap(
      () => telemetry.recordMetric(
        `${name}_duration`,
        Date.now() - startTime,
        labels
      )
    ),
    Effect.tapError(
      (error) => telemetry.log("error", `${name} failed`, {
        error: String(error)
      })
    )
  );
}), "withMetric");
const TelemetryMockLive = Layer.succeed(Telemetry, {
  recordMetric: /* @__PURE__ */ __name(() => Effect.void, "recordMetric"),
  startSpan: /* @__PURE__ */ __name(() => Effect.succeed({ end: /* @__PURE__ */ __name(() => Effect.void, "end") }), "startSpan"),
  log: /* @__PURE__ */ __name(() => Effect.void, "log"),
  events: Stream.empty,
  getMetrics: /* @__PURE__ */ __name(() => Effect.succeed([]), "getMetrics"),
  getAverageDuration: /* @__PURE__ */ __name(() => Effect.succeed(0), "getAverageDuration"),
  getSuccessRate: /* @__PURE__ */ __name(() => Effect.succeed(0), "getSuccessRate"),
  flush: Effect.void
});
export {
  Telemetry,
  TelemetryCollectionError,
  TelemetryLive,
  TelemetryMockLive,
  TelemetryTag,
  withMetric,
  withSpan
};
//# sourceMappingURL=Telemetry.js.map
