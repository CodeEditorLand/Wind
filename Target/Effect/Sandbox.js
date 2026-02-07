var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Context, Effect, Layer } from "effect";
import {
  ConfigurationNotReadyError,
  SandboxNotReadyError
} from "../Types/Sandbox.js";
const Sandbox = Context.GenericTag("Sandbox");
const SandboxLive = Layer.effect(
  Sandbox,
  Effect.gen(function* () {
    const checkReady = Effect.sync(() => {
      const vscode = window.vscode;
      return vscode && typeof vscode === "object";
    });
    const getGlobals = Effect.sync(() => {
      const vscode = window.vscode;
      if (!vscode) throw new SandboxNotReadyError();
      return vscode;
    }).pipe(Effect.mapError(() => new SandboxNotReadyError()));
    const awaitReady = Effect.async(
      (resume) => {
        const vscode = window.vscode;
        if (vscode) {
          resume(Effect.succeed(vscode));
          return;
        }
        const handler = /* @__PURE__ */ __name(() => {
          const vscode2 = window.vscode;
          if (vscode2) {
            resume(Effect.succeed(vscode2));
          } else {
            resume(Effect.fail(new SandboxNotReadyError()));
          }
        }, "handler");
        window.addEventListener("vscode-wind-preload-ready", handler, {
          once: true
        });
        setTimeout(() => {
          resume(Effect.fail(new SandboxNotReadyError()));
        }, 3e4);
        return Effect.sync(() => {
          window.removeEventListener(
            "vscode-wind-preload-ready",
            handler
          );
        });
      }
    ).pipe(
      Effect.timeout("30 seconds"),
      Effect.mapError(() => new SandboxNotReadyError())
    );
    const ipc = Effect.gen(function* () {
      const g = yield* getGlobals;
      if (!g.ipcRenderer) {
        return yield* Effect.fail(new SandboxNotReadyError());
      }
      return g.ipcRenderer;
    });
    const configuration = Effect.gen(function* () {
      const g = yield* getGlobals;
      if (!g.context) {
        return yield* Effect.fail(new SandboxNotReadyError());
      }
      return g.context;
    });
    const resolveConfiguration = Effect.gen(function* () {
      const ctx = yield* configuration;
      return yield* Effect.tryPromise({
        try: /* @__PURE__ */ __name(() => ctx.resolveConfiguration(), "try"),
        catch: /* @__PURE__ */ __name(() => new ConfigurationNotReadyError(), "catch")
      });
    }).pipe(
      Effect.catchAll(
        (error) => error instanceof SandboxNotReadyError ? Effect.fail(new ConfigurationNotReadyError()) : Effect.fail(error)
      )
    );
    return {
      globals: getGlobals,
      isReady: checkReady,
      awaitReady,
      ipc,
      configuration,
      resolveConfiguration
    };
  })
);
const SandboxMockLive = Layer.succeed(Sandbox, {
  globals: Effect.die(new SandboxNotReadyError()),
  isReady: Effect.succeed(false),
  awaitReady: Effect.die(new SandboxNotReadyError()),
  ipc: Effect.die(new SandboxNotReadyError()),
  configuration: Effect.die(new SandboxNotReadyError()),
  resolveConfiguration: Effect.fail(new ConfigurationNotReadyError())
});
export {
  Sandbox,
  SandboxLive,
  SandboxMockLive
};
//# sourceMappingURL=Sandbox.js.map
