var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Context, Layer, Schedule } from "effect";
import { EnvironmentTag } from "./Environment.js";
import { Telemetry } from "./Telemetry.js";
import { MountainTag } from "./Mountain.js";
import { IPCTag } from "./IPC.js";
import { ConfigurationTag } from "./Configuration.js";
class HealthTag extends Context.Tag("Effect/HealthService")() {
  static {
    __name(this, "HealthTag");
  }
}
const createServiceHealth = /* @__PURE__ */ __name((name, status, message, responseTime, details) => ({
  serviceName: name,
  status,
  message,
  lastChecked: Date.now(),
  responseTime,
  details
}), "createServiceHealth");
const createServiceHealthWithNoResponseTime = /* @__PURE__ */ __name((name, status, message) => ({
  serviceName: name,
  status,
  message,
  lastChecked: Date.now(),
  responseTime: 0,
  details: void 0
}), "createServiceHealthWithNoResponseTime");
const makeHealthChecker = /* @__PURE__ */ __name(() => ({
  checkService: /* @__PURE__ */ __name((serviceName) => Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const startTime = Date.now();
    telemetry.log("info", `[Health] Checking service: ${serviceName}`);
    switch (serviceName.toLowerCase()) {
      case "environment":
        const envTime = Date.now() - startTime;
        return Effect.succeed(
          createServiceHealth(
            "Environment",
            "healthy",
            "Environment service available",
            envTime
          )
        );
      case "telemetry":
        yield* telemetry.log("info", "[Health] Telemetry health check");
        const telemetryTime = Date.now() - startTime;
        return Effect.succeed(
          createServiceHealth(
            "Telemetry",
            "healthy",
            "Telemetry service available",
            telemetryTime
          )
        );
      case "mountain": {
        const mountain = yield* MountainTag;
        const mountainTime = Date.now() - startTime;
        return yield* Effect.gen(function* () {
          const version = yield* mountain.version;
          return createServiceHealth(
            "Mountain",
            "healthy",
            `Mountain backend connected (v${version})`,
            mountainTime,
            { version }
          );
        }).pipe(
          Effect.catchAll(
            (error) => Effect.succeed(
              createServiceHealth(
                "Mountain",
                "unhealthy",
                `Mountain connection failed: ${String(error)}`,
                Date.now() - startTime
              )
            )
          )
        );
      }
      case "ipc": {
        const _ipc = yield* IPCTag;
        const ipcTime = Date.now() - startTime;
        return yield* Effect.tryPromise({
          try: /* @__PURE__ */ __name(async () => {
            return createServiceHealth(
              "IPC",
              "healthy",
              "IPC service available",
              ipcTime
            );
          }, "try"),
          catch: /* @__PURE__ */ __name(() => createServiceHealth(
            "IPC",
            "unhealthy",
            "IPC service error",
            Date.now() - startTime
          ), "catch")
        });
      }
      case "configuration": {
        const _config = yield* ConfigurationTag;
        const configTime = Date.now() - startTime;
        return yield* Effect.tryPromise({
          try: /* @__PURE__ */ __name(async () => {
            return createServiceHealth(
              "Configuration",
              "healthy",
              "Configuration service available",
              configTime
            );
          }, "try"),
          catch: /* @__PURE__ */ __name(() => createServiceHealth(
            "Configuration",
            "unhealthy",
            "Configuration service error",
            Date.now() - startTime
          ), "catch")
        });
      }
      default:
        return Effect.succeed(
          createServiceHealthWithNoResponseTime(
            serviceName,
            "unknown",
            `Unknown service: ${serviceName}`
          )
        );
    }
  }), "checkService"),
  checkAllServices: /* @__PURE__ */ __name(() => Effect.gen(function* () {
    const env = yield* EnvironmentTag;
    const envInfo = yield* env.getInfo;
    const services = ["environment", "telemetry", "mountain", "ipc", "configuration"];
    const healthChecker = makeHealthChecker();
    const serviceHealthChecks = services.map(
      (service) => healthChecker.checkService(service)
    );
    const healthResults = yield* Effect.all(serviceHealthChecks);
    const unhealthyCount = healthResults.filter((h) => h.status === "unhealthy").length;
    const degradedCount = healthResults.filter((h) => h.status === "degraded").length;
    let overallStatus = "healthy";
    if (unhealthyCount > 0) {
      overallStatus = "unhealthy";
    } else if (degradedCount > 0) {
      overallStatus = "degraded";
    }
    return {
      overallStatus,
      services: healthResults,
      systemInfo: {
        platform: envInfo.platform,
        architecture: envInfo.architecture,
        upSince: Date.now()
      },
      lastChecked: Date.now()
    };
  }), "checkAllServices"),
  getOverallStatus: /* @__PURE__ */ __name(() => Effect.gen(function* () {
    const healthChecker = makeHealthChecker();
    const systemHealth = yield* healthChecker.checkAllServices();
    return systemHealth.overallStatus;
  }), "getOverallStatus"),
  monitorService: /* @__PURE__ */ __name((serviceName, intervalMs) => Effect.gen(function* () {
    yield* makeHealthChecker().checkService(serviceName).pipe(
      Effect.repeat(Schedule.spaced(`${intervalMs} millis`))
    );
  }), "monitorService")
}), "makeHealthChecker");
const HealthLive = Layer.effect(
  HealthTag,
  Effect.succeed(makeHealthChecker())
);
const makeMockHealth = /* @__PURE__ */ __name((overrides) => ({
  checkService: /* @__PURE__ */ __name((serviceName) => Effect.gen(function* () {
    const defaultStatus = "healthy";
    const status = overrides?.[serviceName] ?? defaultStatus;
    return createServiceHealth(
      serviceName,
      status,
      status === "healthy" ? "Mock service healthy" : "Mock service unhealthy",
      0
    );
  }), "checkService"),
  checkAllServices: /* @__PURE__ */ __name(() => Effect.gen(function* () {
    const services = ["environment", "telemetry", "mountain", "ipc", "configuration"];
    const results = services.map(
      (name) => createServiceHealth(
        name,
        overrides?.[name] ?? "healthy",
        "Mock service check",
        0
      )
    );
    return {
      overallStatus: "healthy",
      services: results,
      systemInfo: {
        platform: "mock",
        architecture: "mock",
        upSince: Date.now()
      },
      lastChecked: Date.now()
    };
  }), "checkAllServices"),
  getOverallStatus: /* @__PURE__ */ __name(() => Effect.succeed("healthy"), "getOverallStatus"),
  monitorService: /* @__PURE__ */ __name(() => Effect.void, "monitorService")
}), "makeMockHealth");
const HealthMock = Layer.effect(HealthTag, Effect.succeed(makeMockHealth()));
export {
  HealthLive,
  HealthMock,
  HealthTag,
  makeMockHealth
};
//# sourceMappingURL=Health.js.map
