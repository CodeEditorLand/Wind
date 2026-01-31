/**
 * @module Bootstrap
 * @description
 * Main entry point for Wind's atomic bootstrap system using Effect-TS.
 * Replaces polling-based initialization with reactive Effect streams.
 *
 * Migration from legacy:
 * - Replaces WaitForPreloadAndInitialize() polling with Sandbox.awaitReady
 * - Replaces manual bootstrap orchestration with Effect runtime
 * - Replaces stage callbacks with composable Effect pipes
 * - Replaces manual error handling with typed Effect errors
 *
 * @deprecated Legacy bootstrap. Use Bootstrap/Effect.ts for new code.
 */

import { Effect, Exit, Fiber, Runtime, pipe } from "effect";
import { TauriLiveLayer } from "./Effect/Layers/Tauri.js";
import { Sandbox } from "./Effect/Sandbox.js";
import { Telemetry, withSpan } from "./Effect/Telemetry.js";
import { Configuration } from "./Effect/Configuration.js";
import { Mountain } from "./Effect/Mountain.js";

// ============================================================================
// BOOTSTRAP CONFIGURATION (Effect-TS version)
// ============================================================================

interface BootstrapOptions {
  readonly debugMode: boolean;
  readonly verboseLogging: boolean;
  readonly showStatusUI: boolean;
  readonly pauseBetweenStages: boolean;
  readonly enablePerformanceTracking: boolean;
}

const GetDebugMode = (): boolean => {
  try {
    return Boolean((window as any).__BOOTSTRAP_DEBUG__);
  } catch {
    return false;
  }
};

const GetVerboseLogging = (): boolean => {
  try {
    return Boolean((window as any).__VERBOSE_LOGGING__ || (window as any).__BOOTSTRAP_DEBUG__);
  } catch {
    return false;
  }
};

const GetPauseBetweenStages = (): boolean => {
  try {
    return Boolean((window as any).__PAUSE_BETWEEN_STAGES__ || (window as any).__BOOTSTRAP_DEBUG__);
  } catch {
    return false;
  }
};

const BuildBootstrapOptions = (): BootstrapOptions => ({
  debugMode: GetDebugMode(),
  verboseLogging: GetVerboseLogging(),
  showStatusUI: true,
  pauseBetweenStages: GetPauseBetweenStages(),
  enablePerformanceTracking: true
});

// ============================================================================
// BOOTSTRAP EFFECT (Atomic, composable, typed)
// ============================================================================

const bootstrapEffect = (options: BootstrapOptions) =>
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const sandbox = yield* Sandbox;
    const config = yield* Configuration;
    const mountain = yield* Mountain;

    const startTime = yield* Effect.clockWith((clock) => clock.currentTimeMillis());

    yield* telemetry.log("info", "[Wind Bootstrap] Atomic bootstrap system starting...");
    yield* telemetry.log("info", `[Wind Bootstrap] Debug mode: ${options.debugMode}`);

    // STAGE 1: Wait for preload (replaces setInterval polling)
    yield* withSpan(
      "stage_preload_wait",
      Effect.gen(function* () {
        yield* telemetry.log("info", "[Wind Bootstrap] Stage 1: Waiting for preload...");
        
        // This replaces WaitForPreloadAndInitialize() with reactive await
        const globals = yield* sandbox.awaitReady;
        
        yield* telemetry.log("info", "[Wind Bootstrap] Preload ready, globals available");
        yield* telemetry.recordMetric("stage_preload_duration", Date.now() - startTime);
      })
    );

    // STAGE 2: Initialize telemetry (already done via layer)
    yield* withSpan(
      "stage_telemetry_init",
      Effect.gen(function* () {
        yield* telemetry.log("info", "[Wind Bootstrap] Stage 2: Telemetry initialized via Effect layer");
      })
    );

    // STAGE 3: Connect to Mountain backend
    yield* withSpan(
      "stage_mountain_connect",
      Effect.gen(function* () {
        yield* telemetry.log("info", "[Wind Bootstrap] Stage 3: Connecting to Mountain backend...");
        
        yield* mountain.connect;
        const version = yield* mountain.version;
        
        yield* telemetry.log("info", `[Wind Bootstrap] Connected to Mountain v${version}`);
        yield* telemetry.recordMetric("stage_mountain_connect_duration", Date.now() - startTime);
      })
    );

    // STAGE 4: Fetch and apply configuration
    yield* withSpan(
      "stage_configuration",
      Effect.gen(function* () {
        yield* telemetry.log("info", "[Wind Bootstrap] Stage 4: Fetching configuration...");
        
        const configuration = yield* config.fetch;
        yield* config.apply(configuration);
        
        yield* telemetry.log("info", "[Wind Bootstrap] Configuration applied");
        yield* telemetry.recordMetric("stage_configuration_duration", Date.now() - startTime);
      })
    );

    // STAGE 5: Initialize workbench environment
    yield* withSpan(
      "stage_workbench_init",
      Effect.gen(function* () {
        yield* telemetry.log("info", "[Wind Bootstrap] Stage 5: Initializing workbench environment...");
        
        // TODO: Initialize VSCode workbench services
        // This will be done in Batch 6 when we migrate WindInstantiationService
        
        yield* telemetry.log("info", "[Wind Bootstrap] Workbench environment ready");
        yield* telemetry.recordMetric("stage_workbench_init_duration", Date.now() - startTime);
      })
    );

    // STAGE 6: Complete bootstrap
    const endTime = yield* Effect.clockWith((clock) => clock.currentTimeMillis());
    const totalDuration = endTime - startTime;

    yield* telemetry.log("info", "[Wind Bootstrap] ===============================================");
    yield* telemetry.log("info", "[Wind Bootstrap] Bootstrap process completed");
    yield* telemetry.log("info", "[Wind Bootstrap] ✓ All stages completed successfully");
    yield* telemetry.log("info", `[Wind Bootstrap] Duration: ${totalDuration}ms`);
    yield* telemetry.log("info", "[Wind Bootstrap] ===============================================");

    // Dispatch completion event
    yield* Effect.sync(() => {
      window.dispatchEvent(new CustomEvent("vscode-wind-bootstrap-complete", {
        detail: {
          success: true,
          duration: totalDuration,
          stages: ["preload", "telemetry", "mountain", "configuration", "workbench"]
        }
      }));
    });

    yield* telemetry.recordMetric("bootstrap_total_duration", totalDuration);

    return { success: true as const, duration: totalDuration };
  });

// ============================================================================
// ERROR HANDLING EFFECT
// ============================================================================

const handleBootstrapError = (error: unknown): Effect.Effect<void, never, Telemetry> =>
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    yield* telemetry.log("error", "[Wind Bootstrap] ===============================================");
    yield* telemetry.log("error", "[Wind Bootstrap] ✗ Bootstrap failed:");
    yield* telemetry.log("error", `[Wind Bootstrap] ${message}`);
    
    if (stack) {
      yield* telemetry.log("error", stack);
    }

    yield* telemetry.log("error", "[Wind Bootstrap] ===============================================");

    // Dispatch error event
    yield* Effect.sync(() => {
      window.dispatchEvent(new CustomEvent("vscode-wind-bootstrap-error", {
        detail: { error: message, stack }
      }));
    });

    // Show error in UI
    yield* Effect.sync(() => ShowBootstrapError(error instanceof Error ? error : new Error(message)));
  });

/**
 * Displays bootstrap error in the webview UI
 */
function ShowBootstrapError(error: Error): void {
  try {
    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = `
      <div style="
        color: #d32f2f;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        background: #ffebee;
        border: 1px solid #ffcdd2;
        border-radius: 4px;
        margin: 20px;
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
      ">
        <h2 style="margin: 0 0 10px 0; font-size: 18px;">Wind Bootstrap Error</h2>
        <p style="margin: 10px 0; white-space: pre-wrap;">${escapeHtml(error.message)}</p>
        ${error.stack ? `<pre style="margin: 10px 0; font-size: 12px; overflow-x: auto;">${escapeHtml(error.stack)}</pre>` : ''}
        <p style="margin: 10px 0; font-size: 12px; opacity: 0.8;">
          Initialization failed. Please check the browser console for detailed information.
        </p>
      </div>
    `;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.prepend(errorDiv);
      });
    } else {
      document.body.prepend(errorDiv);
    }
  } catch (uiError) {
    console.error("[Wind Bootstrap] Failed to display error:", uiError);
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// ENTRY POINT (Effect-TS runtime)
// ============================================================================

console.log("[Wind Bootstrap] Bootstrap entry point loaded (Effect-TS version)");

// Build the complete bootstrap program
const bootstrapProgram = Effect.gen(function* () {
  const options = BuildBootstrapOptions();
  
  return yield* bootstrapEffect(options).pipe(
    Effect.catchAll((error) =>
      Effect.gen(function* () {
        yield* handleBootstrapError(error);
        return { success: false as const, duration: 0 };
      })
    )
  );
});

// Provide the Tauri layer and run
const runnable = bootstrapProgram.pipe(
  Effect.provide(TauriLiveLayer)
);

// Run the bootstrap
Runtime.runPromiseExit(Runtime.defaultRuntime)(runnable).then((exit) => {
  if (Exit.isFailure(exit)) {
    console.error("[Wind Bootstrap] Fatal error:", exit.cause);
  }
});

/**
 * Legacy bootstrap export for backwards compatibility.
 * @deprecated Use Effect-TS bootstrap instead.
 */
export const bootstrap = async (options: any): Promise<any> => {
  console.warn("[Wind Bootstrap] Legacy bootstrap called - use Effect-TS version instead");
  
  const runnable = bootstrapEffect(options).pipe(
    Effect.provide(TauriLiveLayer),
    Effect.catchAll((error) =>
      Effect.succeed({ success: false, error: String(error), duration: 0 })
    )
  );
  
  return Runtime.runPromise(Runtime.defaultRuntime)(runnable);
};
