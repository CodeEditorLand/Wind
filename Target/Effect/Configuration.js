var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  Context,
  Effect,
  Layer,
  Schedule,
  Stream,
  SubscriptionRef
} from "effect";
import {
  ConfigurationNotReadyError
} from "../Types/Sandbox.js";
import { IPC } from "./IPC.js";
import { Sandbox } from "./Sandbox.js";
import { MountainTag } from "./Mountain.js";
class ConfigFetchError extends Error {
  constructor(cause) {
    super(`Failed to fetch configuration: ${String(cause)}`);
    this.cause = cause;
  }
  static {
    __name(this, "ConfigFetchError");
  }
  _tag = "ConfigFetchError";
}
class ConfigValidationError extends Error {
  constructor(issues) {
    super(`Configuration validation failed: ${issues.join(", ")}`);
    this.issues = issues;
  }
  static {
    __name(this, "ConfigValidationError");
  }
  _tag = "ConfigValidationError";
}
class ConfigApplyError extends Error {
  constructor(key, cause) {
    super(`Failed to apply configuration for '${key}': ${String(cause)}`);
    this.key = key;
    this.cause = cause;
  }
  static {
    __name(this, "ConfigApplyError");
  }
  _tag = "ConfigApplyError";
}
const validateConfig = /* @__PURE__ */ __name((config) => {
  const issues = [];
  if (!config || typeof config !== "object") {
    issues.push({ path: "", message: "Configuration must be an object" });
    return issues;
  }
  const cfg = config;
  if (cfg["zoomLevel"] !== void 0) {
    if (typeof cfg["zoomLevel"] !== "number") {
      issues.push({ path: "zoomLevel", message: "Must be a number" });
    } else if (cfg["zoomLevel"] < -10 || cfg["zoomLevel"] > 10) {
      issues.push({
        path: "zoomLevel",
        message: "Must be between -10 and 10"
      });
    }
  }
  if (cfg["userEnv"] !== void 0 && typeof cfg["userEnv"] !== "object") {
    issues.push({ path: "userEnv", message: "Must be an object" });
  }
  if (cfg["workspace"] !== void 0) {
    if (typeof cfg["workspace"] !== "object" || cfg["workspace"] === null) {
      issues.push({ path: "workspace", message: "Must be an object" });
    } else {
      const ws = cfg["workspace"];
      if (ws["id"] !== void 0 && typeof ws["id"] !== "string") {
        issues.push({
          path: "workspace.id",
          message: "Must be a string"
        });
      }
      if (ws["uri"] !== void 0 && typeof ws["uri"] !== "string") {
        issues.push({
          path: "workspace.uri",
          message: "Must be a string"
        });
      }
    }
  }
  return issues;
}, "validateConfig");
class ConfigurationTag extends Context.Tag("Configuration")() {
  static {
    __name(this, "ConfigurationTag");
  }
}
const Configuration = ConfigurationTag;
const ConfigurationLive = Layer.effect(
  Configuration,
  Effect.gen(function* () {
    const sandbox = yield* Sandbox;
    const ipc = yield* IPC;
    const configRef = yield* SubscriptionRef.make(null);
    const fetch = Effect.gen(function* () {
      const fromSandbox = yield* sandbox.resolveConfiguration.pipe(
        Effect.either
      );
      if (fromSandbox._tag === "Right") {
        return fromSandbox.right;
      }
      return yield* ipc.invoke("mountain_get_workbench_configuration")([]).pipe(Effect.mapError((error) => new ConfigFetchError(error)));
    });
    const validate = /* @__PURE__ */ __name((config) => Effect.sync(() => validateConfig(config)).pipe(
      Effect.flatMap(
        (issues) => issues.length > 0 ? Effect.fail(
          new ConfigValidationError(
            issues.map(
              (i) => `${i.path}: ${i.message}`
            )
          )
        ) : Effect.succeed(config)
      )
    ), "validate");
    const apply = /* @__PURE__ */ __name((config) => Effect.gen(function* () {
      if (config.zoomLevel !== void 0) {
        yield* Effect.try({
          try: /* @__PURE__ */ __name(() => {
            if (window && window.vscode) {
              window.vscode.postMessage({
                type: "setZoomLevel",
                payload: config.zoomLevel
              });
            }
          }, "try"),
          catch: /* @__PURE__ */ __name((error) => new ConfigApplyError("zoomLevel", error), "catch")
        });
      }
      if (config.userEnv) {
        for (const [key, value] of Object.entries(config.userEnv || {})) {
          yield* Effect.try({
            try: /* @__PURE__ */ __name(() => {
              if (typeof process !== "undefined" && process.env) {
                process.env[key] = value;
              }
            }, "try"),
            catch: /* @__PURE__ */ __name((error) => new ConfigApplyError(key, error), "catch")
          });
        }
      }
    }), "apply");
    const changes = configRef.changes.pipe(
      Stream.filter((config) => config !== null)
    );
    const get = Effect.gen(function* () {
      const current = yield* configRef.get;
      if (!current) {
        return yield* Effect.fail(
          new ConfigurationNotReadyError()
        );
      }
      return current;
    });
    const refresh = Effect.gen(function* () {
      const config = yield* fetch;
      yield* SubscriptionRef.set(configRef, config);
      return config;
    });
    yield* fetch.pipe(Effect.flatMap((config) => SubscriptionRef.set(configRef, config)));
    yield* Effect.log("[Configuration] Configuration service initialized");
    return {
      get,
      fetch,
      validate,
      apply,
      changes,
      refresh
    };
  })
);
const ConfigurationWithSyncLive = Layer.effect(
  Configuration,
  Effect.gen(function* () {
    const sandbox = yield* Sandbox;
    const ipc = yield* IPC;
    const mountain = yield* MountainTag;
    const configRef = yield* SubscriptionRef.make(null);
    const fetch = Effect.gen(function* () {
      const fromSandbox = yield* sandbox.resolveConfiguration.pipe(
        Effect.either
      );
      if (fromSandbox._tag === "Right") {
        return fromSandbox.right;
      }
      return yield* ipc.invoke("mountain_get_workbench_configuration")([]).pipe(Effect.mapError((error) => new ConfigFetchError(error)));
    });
    const validate = /* @__PURE__ */ __name((config) => Effect.sync(() => validateConfig(config)).pipe(
      Effect.flatMap(
        (issues) => issues.length > 0 ? Effect.fail(
          new ConfigValidationError(
            issues.map(
              (i) => `${i.path}: ${i.message}`
            )
          )
        ) : Effect.succeed(config)
      )
    ), "validate");
    const apply = /* @__PURE__ */ __name((config) => Effect.gen(function* () {
      if (config.zoomLevel !== void 0) {
        yield* Effect.try({
          try: /* @__PURE__ */ __name(() => {
            if (window && window.vscode) {
              window.vscode.postMessage({
                type: "setZoomLevel",
                payload: config.zoomLevel
              });
            }
          }, "try"),
          catch: /* @__PURE__ */ __name((error) => new ConfigApplyError("zoomLevel", error), "catch")
        });
      }
      if (config.userEnv) {
        for (const [key, value] of Object.entries(config.userEnv || {})) {
          yield* Effect.try({
            try: /* @__PURE__ */ __name(() => {
              if (typeof process !== "undefined" && process.env) {
                process.env[key] = value;
              }
            }, "try"),
            catch: /* @__PURE__ */ __name((error) => new ConfigApplyError(key, error), "catch")
          });
        }
      }
    }), "apply");
    const changes = configRef.changes.pipe(
      Stream.filter((config) => config !== null)
    );
    const get = Effect.gen(function* () {
      const current = yield* configRef.get;
      if (!current) {
        return yield* Effect.fail(
          new ConfigurationNotReadyError()
        );
      }
      return current;
    });
    const refresh = Effect.gen(function* () {
      const config = yield* fetch;
      yield* SubscriptionRef.set(configRef, config);
      return config;
    });
    yield* fetch.pipe(Effect.flatMap((config) => SubscriptionRef.set(configRef, config)));
    yield* Effect.fork(
      Effect.gen(function* () {
        const connectionState = yield* mountain.connectionState;
        if (connectionState._tag === "Connected") {
          yield* Effect.repeat(
            Effect.gen(function* () {
              const config = yield* mountain.rpc("mountain_get_configuration")();
              if (config) {
                yield* validate(config).pipe(
                  Effect.flatMap((validatedConfig) => {
                    return Effect.gen(function* () {
                      const current = yield* configRef.get;
                      if (!current || JSON.stringify(current) !== JSON.stringify(validatedConfig)) {
                        yield* SubscriptionRef.set(configRef, validatedConfig);
                        yield* apply(validatedConfig);
                      }
                    });
                  }),
                  Effect.catchAll(
                    (error) => Effect.sync(() => {
                      console.error("[Configuration] Sync error:", error);
                    })
                  )
                );
              }
            }),
            Schedule.spaced("5 seconds")
          );
        }
      })
    );
    yield* Effect.log("[Configuration] Configuration service with sync initialized");
    return {
      get,
      fetch,
      validate,
      apply,
      changes,
      refresh
    };
  })
);
const getConfigValue = /* @__PURE__ */ __name((config, path) => {
  const parts = path.split(".");
  let current = config;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return void 0;
    }
  }
  return current;
}, "getConfigValue");
const makeMockConfiguration = /* @__PURE__ */ __name((overrides) => {
  const mockConfig = {
    zoomLevel: 0,
    userEnv: {},
    workspace: {
      id: "mock-workspace",
      uri: "mock://workspace",
      name: "Mock Workspace"
    },
    ...overrides
  };
  return {
    get: Effect.succeed(mockConfig),
    fetch: Effect.succeed(mockConfig),
    validate: /* @__PURE__ */ __name((config) => Effect.sync(() => {
      const issues = validateConfig(config);
      if (issues.length > 0) {
        return Effect.fail(new ConfigValidationError(issues.map((i) => `${i.path}: ${i.message}`)));
      }
      return Effect.succeed(config);
    }).pipe(Effect.flatten), "validate"),
    apply: /* @__PURE__ */ __name(() => Effect.void, "apply"),
    changes: Stream.empty,
    refresh: Effect.succeed(mockConfig)
  };
}, "makeMockConfiguration");
const ConfigurationMock = Layer.succeed(
  Configuration,
  makeMockConfiguration()
);
export {
  ConfigApplyError,
  ConfigFetchError,
  ConfigValidationError,
  Configuration,
  ConfigurationLive,
  ConfigurationMock,
  ConfigurationTag,
  ConfigurationWithSyncLive,
  getConfigValue,
  makeMockConfiguration
};
//# sourceMappingURL=Configuration.js.map
