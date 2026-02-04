var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Effect, Layer, Context } from "effect";
import { EnvironmentTag } from "./Environment.js";
import { Telemetry, TelemetryTag, withSpan } from "./Telemetry.js";
import { Sandbox } from "./Sandbox.js";
import { Configuration, ConfigurationTag } from "./Configuration.js";
import { MountainTag } from "./Mountain.js";
import { HealthTag } from "./Health.js";
class BootstrapTag extends Context.Tag("Effect/BootstrapService")() {
  static {
    __name(this, "BootstrapTag");
  }
}
const stage0_Environment = withSpan(
  "stage0_environment",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const environment = yield* EnvironmentTag;
    telemetry.log("info", "[Bootstrap] Stage 0: Detecting environment...");
    const envInfo = yield* environment.getInfo;
    telemetry.log(
      "info",
      `[Bootstrap] Environment: ${envInfo.platform}/${envInfo.architecture}`
    );
    telemetry.log("info", `[Bootstrap] Locale: ${envInfo.locale}, Timezone: ${envInfo.timezone}`);
    return {
      stageName: "Environment",
      success: true,
      duration: 0,
      // Will be set by caller
      error: void 0
    };
  })
);
const stage1_Preload = withSpan(
  "stage1_preload",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const sandbox = yield* Sandbox;
    telemetry.log("info", "[Bootstrap] Stage 1: Waiting for preload...");
    void (yield* sandbox.awaitReady);
    telemetry.log("info", "[Bootstrap] Preload ready, globals available");
    return {
      stageName: "Preload",
      success: true,
      duration: 0,
      error: void 0
    };
  })
);
const stage2_Configuration = withSpan(
  "stage2_configuration",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    yield* (yield* Configuration).get;
    telemetry.log("info", "[Bootstrap] Stage 2: Loading configuration...");
    telemetry.log("info", "[Bootstrap] Configuration applied");
    return {
      stageName: "Configuration",
      success: true,
      duration: 0,
      error: void 0
    };
  })
);
const stage3_Services = withSpan(
  "stage3_services",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    telemetry.log("info", "[Bootstrap] Stage 3: Connecting to Mountain backend...");
    yield* (yield* MountainTag).connect;
    telemetry.log("info", "[Bootstrap] Mountain connected");
    return {
      stageName: "Services",
      success: true,
      duration: 0,
      error: void 0
    };
  })
);
const stage4_Preparation = withSpan(
  "stage4_preparation",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    telemetry.log("info", "[Bootstrap] Stage 4: Preparing workbench resources...");
    telemetry.log("info", "[Bootstrap] Workbench resources prepared");
    return {
      stageName: "Preparation",
      success: true,
      duration: 0,
      error: void 0
    };
  })
);
const stage5_Initialization = withSpan(
  "stage5_initialization",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    telemetry.log("info", "[Bootstrap] Stage 5: Initializing VSCode workbench...");
    telemetry.log("info", "[Bootstrap] VSCode workbench initialized");
    yield* Effect.sync(() => {
      window.dispatchEvent(
        new CustomEvent("vscode-wind-bootstrap-complete", {
          detail: { success: true }
        })
      );
    });
    return {
      stageName: "Initialization",
      success: true,
      duration: 0,
      error: void 0
    };
  })
);
const stage6_HealthCheck = withSpan(
  "stage6_healthcheck",
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const health = yield* HealthTag;
    telemetry.log("info", "[Bootstrap] Stage 6: Running health checks...");
    const systemHealth = yield* health.checkAllServices();
    telemetry.log(
      "info",
      `[Bootstrap] Health check result: ${systemHealth.overallStatus}`
    );
    if (systemHealth.overallStatus === "unhealthy") {
      telemetry.log("error", "[Bootstrap] Some services are unhealthy!");
    }
    return {
      stageName: "HealthCheck",
      success: systemHealth.overallStatus !== "unhealthy",
      duration: 0,
      error: void 0
    };
  })
);
const makeBootstrap = /* @__PURE__ */ __name(() => ({
  run: /* @__PURE__ */ __name((options) => Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const startTime = Date.now();
    const { skipHealthCheck = false, debugMode = false } = options ?? {};
    telemetry.log("info", "[Bootstrap] ===============================================");
    telemetry.log("info", "[Bootstrap] Wind VSCode Workbench Bootstrap");
    telemetry.log("info", "[Bootstrap] Debug mode: " + debugMode);
    telemetry.log("info", "[Bootstrap] ===============================================");
    const stages = [
      stage0_Environment,
      stage1_Preload,
      stage2_Configuration,
      stage3_Services,
      stage4_Preparation,
      stage5_Initialization,
      ...skipHealthCheck ? [] : [stage6_HealthCheck]
    ];
    const results = [];
    for (const stage of stages) {
      const stageStartTime = Date.now();
      const result = yield* Effect.suspend(() => stage).pipe(
        Effect.map((r) => ({ ...r, duration: Date.now() - stageStartTime })),
        Effect.catchAll(
          (error) => Effect.succeed({
            stageName: "Unknown",
            success: false,
            duration: Date.now() - stageStartTime,
            error
          })
        )
      );
      results.push(result);
    }
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    const allSuccess = results.every((r) => r.success);
    telemetry.log("info", "[Bootstrap] ===============================================");
    telemetry.log(
      "info",
      `[Bootstrap] ${allSuccess ? "\u2713 Bootstrap completed successfully" : "\u2717 Bootstrap failed"}`
    );
    telemetry.log("info", `[Bootstrap] Total duration: ${totalDuration}ms`);
    telemetry.log("info", "[Bootstrap] ===============================================");
    if (!allSuccess) {
      const failedStages = results.filter((r) => !r.success);
      telemetry.log("error", "[Bootstrap] Failed stages:");
      for (const failed of failedStages) {
        telemetry.log("error", `[Bootstrap]   - ${failed.stageName}: ${failed.error?.message || "Unknown error"}`);
      }
    }
    return {
      success: allSuccess,
      totalDuration,
      stages: results,
      error: allSuccess ? void 0 : new Error("Bootstrap failed")
    };
  }), "run")
}), "makeBootstrap");
const BootstrapLive = Layer.effect(
  BootstrapTag,
  Effect.succeed(makeBootstrap())
);
const makeMockBootstrap = /* @__PURE__ */ __name(() => ({
  run: /* @__PURE__ */ __name((options) => Effect.gen(function* () {
    yield* Effect.sleep("1 millis");
    return {
      success: true,
      totalDuration: 1,
      stages: [
        { stageName: "Environment", success: true, duration: 0, error: void 0 },
        { stageName: "Preload", success: true, duration: 0, error: void 0 },
        { stageName: "Configuration", success: true, duration: 0, error: void 0 },
        { stageName: "Services", success: true, duration: 0, error: void 0 },
        { stageName: "Preparation", success: true, duration: 0, error: void 0 },
        { stageName: "Initialization", success: true, duration: 0, error: void 0 },
        ...options?.skipHealthCheck ? [] : [{ stageName: "HealthCheck", success: true, duration: 0, error: void 0 }]
      ],
      error: void 0
    };
  }), "run")
}), "makeMockBootstrap");
const BootstrapMock = Layer.effect(BootstrapTag, Effect.succeed(makeMockBootstrap()));
const runBootstrap = /* @__PURE__ */ __name((options) => Effect.gen(function* () {
  const bootstrap = yield* BootstrapTag;
  return yield* bootstrap.run(options);
}).pipe(
  Effect.provide(BootstrapLive)
), "runBootstrap");
export {
  BootstrapLive,
  BootstrapMock,
  BootstrapTag,
  makeMockBootstrap,
  runBootstrap
};
//# sourceMappingURL=Bootstrap.js.map
