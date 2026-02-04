var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect, Fiber, Layer, Schedule, Stream, SubscriptionRef } from "effect";
import { Configuration } from "./Configuration.js";
import { IPC } from "./IPC.js";
import { Telemetry, withSpan } from "./Telemetry.js";
class MountainConnectionError extends Error {
  static {
    __name(this, "MountainConnectionError");
  }
  _tag = "MountainConnectionError";
  _cause;
  constructor(cause) {
    super(`Failed to connect to Mountain backend: ${String(cause)}`);
    this._cause = cause;
    Object.setPrototypeOf(this, MountainConnectionError.prototype);
  }
  get cause() {
    return this._cause;
  }
  get name() {
    return "MountainConnectionError";
  }
}
class MountainRPCError extends Error {
  static {
    __name(this, "MountainRPCError");
  }
  _tag = "MountainRPCError";
  _method;
  _cause;
  constructor(method, cause) {
    super(`Mountain RPC '${method}' failed: ${String(cause)}`);
    this._method = method;
    this._cause = cause;
    Object.setPrototypeOf(this, MountainRPCError.prototype);
  }
  get method() {
    return this._method;
  }
  get cause() {
    return this._cause;
  }
  get name() {
    return "MountainRPCError";
  }
}
class MountainSyncError extends Error {
  static {
    __name(this, "MountainSyncError");
  }
  _tag = "MountainSyncError";
  _resource;
  _cause;
  constructor(resource, cause) {
    super(`Mountain sync for '${resource}' failed: ${String(cause)}`);
    this._resource = resource;
    this._cause = cause;
    Object.setPrototypeOf(this, MountainSyncError.prototype);
  }
  get resource() {
    return this._resource;
  }
  get cause() {
    return this._cause;
  }
  get name() {
    return "MountainSyncError";
  }
}
class MountainStateError extends Error {
  static {
    __name(this, "MountainStateError");
  }
  _tag = "MountainStateError";
  _expected;
  _actual;
  constructor(expected, actual) {
    super(`Mountain state error: expected ${expected}, got ${actual}`);
    this._expected = expected;
    this._actual = actual;
    Object.setPrototypeOf(this, MountainStateError.prototype);
  }
  get expected() {
    return this._expected;
  }
  get actual() {
    return this._actual;
  }
}
class MountainTag extends Context.Tag("Mountain")() {
  static {
    __name(this, "MountainTag");
  }
}
const Mountain = MountainTag;
const MountainLive = Layer.effect(
  Mountain,
  Effect.gen(function* () {
    const ipc = yield* IPC;
    const config = yield* Configuration;
    const telemetry = yield* Telemetry;
    const stateRef = yield* SubscriptionRef.make({
      _tag: "Idle"
    });
    const syncEventsRef = yield* SubscriptionRef.make([]);
    const retrySchedule = Schedule.exponential("100 millis").pipe(
      Schedule.union(Schedule.spaced("5 seconds")),
      Schedule.intersect(Schedule.recurs(10))
    );
    const setState = /* @__PURE__ */ __name((state) => Effect.gen(function* () {
      yield* SubscriptionRef.modify(stateRef, () => [void 0, state]);
      yield* telemetry.log("info", `Mountain state: ${state._tag}`);
    }), "setState");
    const connectionState = stateRef.get;
    const connectionChanges = stateRef.changes;
    const connect = Effect.gen(function* () {
      yield* setState({ _tag: "Connecting", attempt: 1 });
      return yield* Effect.retry(
        Effect.gen(function* () {
          const status = yield* ipc.invoke("mountain_get_status")([]).pipe(
            Effect.mapError(
              (error) => new MountainConnectionError(error)
            )
          );
          if (!status.connected) {
            return yield* Effect.fail(
              new MountainConnectionError("Mountain not ready")
            );
          }
          yield* setState({
            _tag: "Connected",
            version: status.version
          });
          yield* telemetry.log(
            "info",
            `Connected to Mountain v${status.version}`
          );
        }).pipe(withSpan("mountain_connect")),
        retrySchedule
      ).pipe(
        Effect.catchAll(
          (error) => Effect.gen(function* () {
            yield* setState({ _tag: "Error", error });
            yield* telemetry.log(
              "error",
              `Failed to connect: ${error.message}`
            );
            return yield* Effect.fail(error);
          })
        )
      );
    });
    const disconnect = Effect.gen(function* () {
      yield* setState({ _tag: "Disconnected", reason: "manual" });
      yield* telemetry.log("info", "Disconnected from Mountain");
    });
    const rpc = /* @__PURE__ */ __name((method) => (args) => Effect.gen(function* () {
      const currentState = yield* stateRef.get;
      if (currentState._tag !== "Connected") {
        yield* connect;
      }
      const span = yield* telemetry.startSpan(`rpc_${method}`);
      return yield* ipc.invoke(method)(args ? [args] : []).pipe(
        Effect.mapError(
          (error) => new MountainRPCError(method, error)
        ),
        Effect.tap(() => span.end(true)),
        Effect.catchAll(
          (error) => Effect.gen(function* () {
            yield* span.end(false, error.message);
            if (String(error).includes("connection") || String(error).includes("network")) {
              yield* setState({
                _tag: "Disconnected",
                reason: "connection_lost"
              });
            }
            return yield* Effect.fail(error);
          })
        )
      );
    }), "rpc");
    const sync = /* @__PURE__ */ __name((resourceType) => Effect.gen(function* () {
      const span = yield* telemetry.startSpan(`sync_${resourceType}`);
      const startTime = Date.now();
      yield* telemetry.log(
        "info",
        `Starting sync for ${resourceType}`
      );
      const result = yield* Effect.gen(function* () {
        switch (resourceType) {
          case "configuration": {
            const mountainConfig = yield* rpc("mountain_get_configuration")();
            const localConfig = yield* config.get;
            const mountainHash = JSON.stringify(mountainConfig);
            const localHash = JSON.stringify(localConfig);
            if (mountainHash !== localHash) {
              yield* config.apply(mountainConfig);
              const resource = {
                type: "configuration",
                id: "main",
                data: mountainConfig,
                timestamp: Date.now(),
                hash: mountainHash
              };
              yield* SubscriptionRef.modify(syncEventsRef, (events) => [void 0, [...events, resource].slice(-1e3)]);
            }
            return {
              success: true,
              resourcesSynced: 1,
              errors: []
            };
          }
          case "services": {
            const services = yield* rpc("mountain_get_services_status")();
            const resource = {
              type: "services",
              id: "all",
              data: services,
              timestamp: Date.now(),
              hash: JSON.stringify(services)
            };
            yield* SubscriptionRef.modify(syncEventsRef, (events) => [void 0, [...events, resource].slice(-1e3)]);
            return {
              success: true,
              resourcesSynced: Object.keys(services).length,
              errors: []
            };
          }
          case "state": {
            const state = yield* rpc(
              "mountain_get_state"
            )();
            const resource = {
              type: "state",
              id: "main",
              data: state,
              timestamp: Date.now(),
              hash: JSON.stringify(state)
            };
            yield* SubscriptionRef.modify(syncEventsRef, (events) => [void 0, [...events, resource].slice(-1e3)]);
            return {
              success: true,
              resourcesSynced: 1,
              errors: []
            };
          }
          default:
            return {
              success: false,
              resourcesSynced: 0,
              errors: [
                `Unknown resource type: ${resourceType}`
              ]
            };
        }
      }).pipe(
        Effect.tap(
          (result2) => span.end(result2.success, result2.errors[0])
        ),
        Effect.catchAll(
          (error) => Effect.gen(function* () {
            yield* span.end(false, error.message);
            return yield* Effect.fail(
              new MountainSyncError(resourceType, error)
            );
          })
        )
      );
      const duration = Date.now() - startTime;
      return {
        ...result,
        duration
      };
    }), "sync");
    const syncEvents = syncEventsRef.changes.pipe(
      Stream.flatMap((events) => Stream.fromIterable(events))
    );
    const version = Effect.gen(function* () {
      const status = yield* rpc(
        "mountain_get_status"
      )();
      return status.version;
    });
    const healthCheck = Effect.gen(function* () {
      return yield* Effect.orElse(
        rpc("mountain_get_status")().pipe(
          Effect.map((status) => status.connected === true)
        ),
        () => Effect.succeed(false)
      );
    });
    const setupBackgroundSync = Effect.gen(function* () {
      yield* Stream.runForEach(
        connectionChanges,
        (state) => state._tag === "Connected" ? Effect.gen(function* () {
          yield* telemetry.log(
            "info",
            "Starting background sync"
          );
          yield* sync("configuration").pipe(
            Effect.catchAll(
              (error) => telemetry.log(
                "error",
                `Initial config sync failed: ${error.message}`
              )
            )
          );
          const syncFiber = yield* Stream.fromSchedule(
            Schedule.spaced("5 seconds")
          ).pipe(
            Stream.runForEach(
              () => sync("configuration").pipe(
                Effect.catchAll(
                  (error) => telemetry.log(
                    "error",
                    `Periodic sync failed: ${error.message}`
                  )
                )
              )
            ),
            Effect.fork
          );
          yield* connectionChanges.pipe(
            Stream.filter(
              (s) => s._tag === "Disconnected" || s._tag === "Error"
            ),
            Stream.runForEach(
              () => Fiber.interrupt(syncFiber)
            )
          );
        }) : Effect.void
      );
    }).pipe(Effect.fork);
    yield* setupBackgroundSync;
    yield* telemetry.log("info", "Mountain service initialized");
    return {
      connectionState,
      connectionChanges,
      connect,
      disconnect,
      rpc,
      sync,
      syncEvents,
      version,
      healthCheck
    };
  })
);
const MountainMockLive = Layer.succeed(Mountain, {
  connectionState: Effect.succeed({
    _tag: "Connected",
    version: "mock"
  }),
  connectionChanges: Stream.empty,
  connect: Effect.void,
  disconnect: Effect.void,
  rpc: /* @__PURE__ */ __name(() => () => Effect.succeed({}), "rpc"),
  sync: /* @__PURE__ */ __name(() => Effect.succeed({
    success: true,
    resourcesSynced: 0,
    errors: [],
    duration: 0
  }), "sync"),
  syncEvents: Stream.empty,
  version: Effect.succeed("mock"),
  healthCheck: Effect.succeed(true)
});
export {
  Mountain,
  MountainConnectionError,
  MountainLive,
  MountainMockLive,
  MountainRPCError,
  MountainStateError,
  MountainSyncError,
  MountainTag
};
//# sourceMappingURL=Mountain.js.map
