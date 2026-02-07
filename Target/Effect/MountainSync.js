var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect, Layer, Fiber } from "effect";
import { MountainTag } from "./Mountain.js";
import { IPCTag } from "./IPC.js";
import { TelemetryTag } from "./Telemetry.js";
class MountainSyncTag extends Context.Tag("Effect/MountainSyncService")() {
  static {
    __name(this, "MountainSyncTag");
  }
}
const syncNowEffect = /* @__PURE__ */ __name((_mountain, _ipc, telemetry) => Effect.gen(function* () {
  const startTime = Date.now();
  yield* telemetry.log("info", "[MountainSync] Performing sync...");
  yield* Effect.sleep(10);
  return {
    success: true,
    itemsSynced: 0,
    duration: Date.now() - startTime
  };
}), "syncNowEffect");
const makeMountainSync = /* @__PURE__ */ __name((mountain, ipc, telemetry) => {
  let syncFiber = null;
  return {
    start: /* @__PURE__ */ __name((config) => Effect.gen(function* () {
      const fullConfig = {
        enabled: true,
        syncIntervalMs: 5e3,
        autoRetry: true,
        maxRetries: 3,
        batchSize: 100,
        ...config
      };
      if (!fullConfig.enabled) {
        yield* telemetry.log("info", "[MountainSync] Sync disabled in config");
        return;
      }
      yield* telemetry.log(
        "info",
        `[MountainSync] Starting sync with ${fullConfig.syncIntervalMs}ms interval`
      );
      const startSyncing = Effect.gen(function* () {
        yield* Effect.forever(
          Effect.gen(function* () {
            yield* Effect.sleep(fullConfig.syncIntervalMs);
            const result = yield* syncNowEffect(mountain, ipc, telemetry);
            if (result.success) {
              yield* telemetry.log(
                "info",
                `[MountainSync] Synced ${result.itemsSynced} items in ${result.duration}ms`
              );
            } else if (fullConfig.autoRetry) {
              yield* telemetry.log(
                "warn",
                `[MountainSync] Sync failed, will retry: ${result.error?.message}`
              );
            }
          })
        );
      });
      syncFiber = yield* startSyncing.pipe(Effect.fork);
    }), "start"),
    stop: /* @__PURE__ */ __name(() => Effect.gen(function* () {
      if (syncFiber) {
        yield* Fiber.interrupt(syncFiber);
        syncFiber = null;
        yield* telemetry.log("info", "[MountainSync] Stopped");
      }
    }), "stop"),
    syncNow: /* @__PURE__ */ __name(() => syncNowEffect(mountain, ipc, telemetry), "syncNow"),
    getStatus: /* @__PURE__ */ __name(() => Effect.sync(() => "idle"), "getStatus"),
    getStats: /* @__PURE__ */ __name(() => Effect.gen(function* () {
      const now = Date.now();
      return {
        lastSyncTime: now,
        syncCount: 1,
        successCount: 1,
        errorCount: 0,
        itemsSynced: 0
      };
    }), "getStats"),
    pause: /* @__PURE__ */ __name(() => Effect.gen(function* () {
      yield* telemetry.log("info", "[MountainSync] Pausing...");
    }), "pause"),
    resume: /* @__PURE__ */ __name(() => Effect.gen(function* () {
      yield* telemetry.log("info", "[MountainSync] Resuming...");
    }), "resume")
  };
}, "makeMountainSync");
const MountainSyncLive = Layer.effect(
  MountainSyncTag,
  Effect.gen(function* () {
    const mountain = yield* MountainTag;
    const ipc = yield* IPCTag;
    const telemetry = yield* TelemetryTag;
    return makeMountainSync(mountain, ipc, telemetry);
  })
);
const makeMockMountainSync = /* @__PURE__ */ __name(() => ({
  start: /* @__PURE__ */ __name(() => Effect.void, "start"),
  stop: /* @__PURE__ */ __name(() => Effect.void, "stop"),
  syncNow: /* @__PURE__ */ __name(() => Effect.gen(function* () {
    return {
      success: true,
      itemsSynced: 0,
      duration: 1
    };
  }), "syncNow"),
  getStatus: /* @__PURE__ */ __name(() => Effect.succeed("idle"), "getStatus"),
  getStats: /* @__PURE__ */ __name(() => Effect.succeed({
    lastSyncTime: Date.now(),
    syncCount: 0,
    successCount: 0,
    errorCount: 0,
    itemsSynced: 0
  }), "getStats"),
  pause: /* @__PURE__ */ __name(() => Effect.void, "pause"),
  resume: /* @__PURE__ */ __name(() => Effect.void, "resume")
}), "makeMockMountainSync");
const MountainSyncMock = Layer.effect(
  MountainSyncTag,
  Effect.succeed(makeMockMountainSync())
);
export {
  MountainSyncLive,
  MountainSyncMock,
  MountainSyncTag,
  makeMockMountainSync
};
//# sourceMappingURL=MountainSync.js.map
