var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Context, Layer, Schedule } from "effect";
import { EnvironmentTag } from "./Environment.js";
import { TelemetryTag } from "./Telemetry.js";
import { MountainTag } from "./Mountain.js";
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
    const startTime = Date.now();
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
        const telemetryService = yield* TelemetryTag;
        const telemetryTime = Date.now() - startTime;
        return yield* telemetryService.log("info", "[Health] Telemetry health check").pipe(
          Effect.map(
            () => createServiceHealth(
              "Telemetry",
              "healthy",
              "Telemetry service available",
              telemetryTime
            )
          ),
          Effect.catchAll(
            () => Effect.succeed(
              createServiceHealth(
                "Telemetry",
                "unhealthy",
                "Telemetry service error",
                telemetryTime
              )
            )
          )
        );
      case "mountain": {
        const mountain = yield* MountainTag;
        const mountainTime = Date.now() - startTime;
        return yield* mountain.version.pipe(
          Effect.map(
            (version) => createServiceHealth(
              "Mountain",
              "healthy",
              `Mountain backend connected (v${version})`,
              mountainTime,
              { version }
            )
          ),
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
        const ipcTime = Date.now() - startTime;
        return Effect.succeed(
          createServiceHealth(
            "IPC",
            "healthy",
            "IPC service available",
            ipcTime
          )
        );
      }
      case "configuration": {
        const config = yield* ConfigurationTag;
        const configTime = Date.now() - startTime;
        return yield* config.get.pipe(
          Effect.map(
            () => createServiceHealth(
              "Configuration",
              "healthy",
              "Configuration service available",
              configTime
            )
          ),
          Effect.catchAll(
            () => Effect.succeed(
              createServiceHealth(
                "Configuration",
                "unhealthy",
                "Configuration service error",
                configTime
              )
            )
          )
        );
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
