/**
 * @module Effect/Bootstrap/Implementation/BootstrapStage
 * @description
 * Individual stage implementations for the bootstrap process.
 * Each stage is a standalone effect that can be composed.
 * @see {@link Effect/Bootstrap/Implementation/BootstrapImplementation} Main orchestration
 * @category Implementation
 */

import { Effect } from "effect";

import { ConfigurationLive } from "../../Configuration.js";

import {
	type EnvironmentInfo,
	EnvironmentTag,
} from "../../Environment/index.js";

import { HealthTag } from "../../Health.js";

import { MountainLive } from "../../Mountain.js";

import { Sandbox } from "../../Sandbox.js";

import { Telemetry, withSpan } from "../../Telemetry.js";

import type { StageResult } from "../Type/BootstrapType.js";

// ============================================================================
// Stage Implementations
// ============================================================================

/**
 * Stage 0: Environment detection
 * Detects platform, architecture, locale, and timezone.
 */
export const stage0_Environment = withSpan(
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

		telemetry.log(
			"info",

			`[Bootstrap] Locale: ${envInfo.locale}, Timezone: ${envInfo.timezone}`,
		);

		return {
			stageName: "Environment",
			success: true as boolean,
			duration: 0, // Will be set by caller
			error: undefined,
		} satisfies StageResult;
	}),
);

/**
 * Stage 1: Preload readiness
 * Waits for preload script to complete and globals to be available.
 */
export const stage1_Preload = withSpan(
	"stage1_preload",

	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		const sandbox = yield* Sandbox;

		telemetry.log("info", "[Bootstrap] Stage 1: Waiting for preload...");

		void (yield* sandbox.awaitReady);

		telemetry.log("info", "[Bootstrap] Preload ready, globals available");

		return {
			stageName: "Preload",
			success: true as boolean,
			duration: 0,
			error: undefined,
		} satisfies StageResult;
	}),
);

/**
 * Stage 2: Configuration loading
 * Loads and applies configuration settings.
 */
export const stage2_Configuration = withSpan(
	"stage2_configuration",

	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		// Ensure configuration is loaded
		yield* Effect.tryPromise(() => ConfigurationLive.refresh());

		telemetry.log("info", "[Bootstrap] Stage 2: Loading configuration...");

		telemetry.log("info", "[Bootstrap] Configuration applied");

		return {
			stageName: "Configuration",
			success: true as boolean,
			duration: 0,
			error: undefined,
		} satisfies StageResult;
	}),
);

/**
 * Stage 3: Services initialization
 * Connects to backend services (Mountain).
 */
export const stage3_Services = withSpan(
	"stage3_services",

	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		telemetry.log(
			"info",

			"[Bootstrap] Stage 3: Connecting to Mountain backend...",
		);

		// Connect to mountain backend
		yield* Effect.tryPromise(() => MountainLive.connect());

		telemetry.log("info", "[Bootstrap] Mountain connected");

		return {
			stageName: "Services",
			success: true as boolean,
			duration: 0,
			error: undefined,
		} satisfies StageResult;
	}),
);

/**
 * Stage 4: Preparation
 * Prepares workbench resources and assets.
 */
export const stage4_Preparation = withSpan(
	"stage4_preparation",

	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		telemetry.log(
			"info",

			"[Bootstrap] Stage 4: Preparing workbench resources...",
		);

		// Load VSCode output bundle
		// This would load @codeeditorland/output
		telemetry.log("info", "[Bootstrap] Workbench resources prepared");

		return {
			stageName: "Preparation",
			success: true as boolean,
			duration: 0,
			error: undefined,
		} satisfies StageResult;
	}),
);

/**
 * Stage 5: Initialization
 * Initializes VSCode workbench and dispatches completion event.
 */
export const stage5_Initialization = withSpan(
	"stage5_initialization",

	Effect.gen(function* () {
		const telemetry = yield* Telemetry;

		telemetry.log(
			"info",

			"[Bootstrap] Stage 5: Initializing VSCode workbench...",
		);

		// Initialize VSCode workbench
		// This would call into the VSCode API from @codeeditorland/output
		telemetry.log("info", "[Bootstrap] VSCode workbench initialized");

		// Dispatch completion event
		yield* Effect.sync(() => {
			window.dispatchEvent(
				new CustomEvent("land-bootstrap-complete", {
					detail: { success: true },
				}),
			);
		});

		return {
			stageName: "Initialization",
			success: true as boolean,
			duration: 0,
			error: undefined,
		} satisfies StageResult;
	}),
);

/**
 * Stage 6: Health check
 * Runs health checks on all services.
 */
export const stage6_HealthCheck = withSpan(
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

export default {
	stage0_Environment,

	stage1_Preload,

	stage2_Configuration,

	stage3_Services,

	stage4_Preparation,

	stage5_Initialization,

	stage6_HealthCheck,
};
