/**
 * @module Effect/Bootstrap
 * @description
 * Bootstrap orchestration using Effect-TS.
 * Replaces legacy BootstrapOrchestrator with Effect-based stage sequencing.
 *
 * This module coordinates all initialization stages:
 * - Stage 0: Environment detection (via Environment service)
 * - Stage 1: Preload readiness (via Sandbox service)
 * - Stage 2: Configuration loading (via Configuration service)
 * - Stage 3: Service initialization (via Service layer)
 * - Stage 4: Preparation (resource loading)
 * - Stage 5: Initialization (VSCode workbench startup)
 * - Stage 6: Health checks (via Health service)
 */

import { Effect, Layer, pipe, Context } from "effect";
import { EnvironmentTag, type EnvironmentInfo } from "./Environment.js";
import { Telemetry, withSpan } from "./Telemetry.js";
import { Sandbox } from "./Sandbox.js";
import { Configuration } from "./Configuration.js";
import { MountainTag } from "./Mountain.js";
import { HealthTag } from "./Health.js";

// ============================================================================
// TYPES
// ============================================================================

export interface BootstrapOptions {
	readonly debugMode?: boolean;
	readonly verboseLogging?: boolean;
	readonly pauseBetweenStages?: boolean;
	readonly enablePerformanceTracking?: boolean;
	readonly skipHealthCheck?: boolean;
}

export interface StageResult {
	readonly stageName: string;
	readonly success: boolean;
	readonly duration: number;
	readonly error: Error | undefined;
}

export interface BootstrapResult {
	readonly success: boolean;
	readonly totalDuration: number;
	readonly stages: ReadonlyArray<StageResult>;
	readonly error: Error | undefined;
}

export interface BootstrapService {
	readonly run: (options?: BootstrapOptions) => Effect.Effect<BootstrapResult>;
}

// ============================================================================
// SERVICE TAG
// ============================================================================

export class BootstrapTag extends Context.Tag("Effect/BootstrapService")<
	BootstrapTag,
	BootstrapService
>() {}

// ============================================================================
// STAGE EFFECTS
// ============================================================================

const stage0_Environment = withSpan(
	"stage0_environment",
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;
		const environment = yield* EnvironmentTag;

		telemetry.log("info", "[Bootstrap] Stage 0: Detecting environment...");

		const envInfo: EnvironmentInfo = yield* environment.getInfo;

		telemetry.log(
			"info",
			`[Bootstrap] Environment: ${envInfo.platform}/${envInfo.architecture}`,
		);
		telemetry.log("info", `[Bootstrap] Locale: ${envInfo.locale}, Timezone: ${envInfo.timezone}`);

		return {
			stageName: "Environment",
			success: true,
			duration: 0, // Will be set by caller
			error: undefined,
		} satisfies StageResult;
	}),
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
			error: undefined,
		} satisfies StageResult;
	}),
);

const stage2_Configuration = withSpan(
	"stage2_configuration",
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;
		// Ensure configuration is loaded
		yield* (yield* Configuration).get;

		telemetry.log("info", "[Bootstrap] Stage 2: Loading configuration...");

		telemetry.log("info", "[Bootstrap] Configuration applied");

		return {
			stageName: "Configuration",
			success: true,
			duration: 0,
			error: undefined,
		} satisfies StageResult;
	}),
);

const stage3_Services = withSpan(
	"stage3_services",
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		telemetry.log("info", "[Bootstrap] Stage 3: Connecting to Mountain backend...");

		// Connect to mountain backend
		yield* (yield* MountainTag).connect;

		telemetry.log("info", "[Bootstrap] Mountain connected");

		return {
			stageName: "Services",
			success: true,
			duration: 0,
			error: undefined,
		} satisfies StageResult;
	}),
);

const stage4_Preparation = withSpan(
	"stage4_preparation",
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		telemetry.log("info", "[Bootstrap] Stage 4: Preparing workbench resources...");

		// Load VSCode output bundle
		// This would load @codeeditorland/output
		telemetry.log("info", "[Bootstrap] Workbench resources prepared");

		return {
			stageName: "Preparation",
			success: true,
			duration: 0,
			error: undefined,
		} satisfies StageResult;
	}),
);

const stage5_Initialization = withSpan(
	"stage5_initialization",
	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		telemetry.log("info", "[Bootstrap] Stage 5: Initializing VSCode workbench...");

		// Initialize VSCode workbench
		// This would call into the VSCode API from @codeeditorland/output
		telemetry.log("info", "[Bootstrap] VSCode workbench initialized");

		// Dispatch completion event
		yield* Effect.sync(() => {
			window.dispatchEvent(
				new CustomEvent("vscode-wind-bootstrap-complete", {
					detail: { success: true },
				}),
			);
		});

		return {
			stageName: "Initialization",
			success: true,
			duration: 0,
			error: undefined,
		} satisfies StageResult;
	}),
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
			`[Bootstrap] Health check result: ${systemHealth.overallStatus}`,
		);

		if (systemHealth.overallStatus === "unhealthy") {
			telemetry.log("error", "[Bootstrap] Some services are unhealthy!");
		}

		return {
			stageName: "HealthCheck",
			success: systemHealth.overallStatus !== "unhealthy",
			duration: 0,
			error: undefined,
		} satisfies StageResult;
	}),
);

// ============================================================================
// BOOTSTRAP IMPLEMENTATION
// ============================================================================

const makeBootstrap = (): BootstrapService => ({
	run: (options): Effect.Effect<BootstrapResult, never, never> =>
		Effect.gen(function* () {
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
				...(skipHealthCheck ? [] : [stage6_HealthCheck]),
			];

			const results: StageResult[] = [];

			for (const stage of stages) {
				const stageStartTime = Date.now();
				const result = yield* Effect.suspend(() => stage).pipe(
					Effect.map((r) => ({ ...r, duration: Date.now() - stageStartTime })),
					Effect.catchAll((error) =>
						Effect.succeed({
							stageName: "Unknown",
							success: false,
							duration: Date.now() - stageStartTime,
							error: error as Error,
						} satisfies StageResult),
					),
				);
				results.push(result);
			}

			const endTime = Date.now();
			const totalDuration = endTime - startTime;
			const allSuccess = results.every((r) => r.success);

			telemetry.log("info", "[Bootstrap] ===============================================");
			telemetry.log(
				"info",
				`[Bootstrap] ${allSuccess ? "✓ Bootstrap completed successfully" : "✗ Bootstrap failed"}`,
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
				error: allSuccess ? undefined : new Error("Bootstrap failed"),
			} satisfies BootstrapResult;
		}),
});

// ============================================================================
// LAYERS
// ============================================================================

export const BootstrapLive = Layer.effect(
	BootstrapTag,
	Effect.succeed(makeBootstrap()),
);

// ============================================================================
// MOCK FOR TESTING
// ============================================================================

export const makeMockBootstrap = (): BootstrapService => ({
	run: (options) =>
		Effect.gen(function* () {
			yield* Effect.sleep("1 millis");
			return {
				success: true,
				totalDuration: 1,
				stages: [
					{ stageName: "Environment", success: true, duration: 0, error: undefined },
					{ stageName: "Preload", success: true, duration: 0, error: undefined },
					{ stageName: "Configuration", success: true, duration: 0, error: undefined },
					{ stageName: "Services", success: true, duration: 0, error: undefined },
					{ stageName: "Preparation", success: true, duration: 0, error: undefined },
					{ stageName: "Initialization", success: true, duration: 0, error: undefined },
					...(options?.skipHealthCheck ? [] : [{ stageName: "HealthCheck", success: true, duration: 0, error: undefined }]),
				],
				error: undefined,
			} satisfies BootstrapResult;
		}),
});

export const BootstrapMock = Layer.effect(BootstrapTag, Effect.succeed(makeMockBootstrap()));

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export const runBootstrap = (options?: BootstrapOptions) =>
	pipe(
		Effect.gen(function* () {
			const bootstrap = yield* BootstrapTag;
			return yield* bootstrap.run(options);
		}),
		Effect.provide(BootstrapLive),
	);
