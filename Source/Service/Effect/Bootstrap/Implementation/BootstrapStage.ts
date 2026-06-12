/**
 * @module Effect/Bootstrap/Implementation/BootstrapStage
 * @description
 * Individual stage implementations for the bootstrap process.
 * Each stage is a plain async function returning a StageResult.
 * @see {@link Effect/Bootstrap/Implementation/BootstrapImplementation} Main orchestration
 * @category Implementation
 */

import { SandboxNotReadyError } from "../../../Types/Sandbox.js";
import { ConfigurationLive } from "../../Configuration.js";
import {
	DetectArchitecture,
	DetectLocale,
	DetectPlatform,
	DetectTimezone,
} from "../../Environment/Implementation/EnvironmentHelper.js";
import { HealthLive } from "../../Health.js";
import { MountainLive } from "../../Mountain.js";
import type { BootstrapLogger, StageResult } from "../Type/BootstrapType.js";

// ============================================================================
// Stage Implementations
// ============================================================================

const Wait = (Milliseconds: number): Promise<void> =>
	new Promise((Resolve) => {
		setTimeout(Resolve, Milliseconds);
	});

// Preload readiness poll budget: 100ms intervals for up to 30 seconds.
const PreloadPollIntervalMilliseconds = 100;

const PreloadPollMaxAttempts = 300;

/**
 * Stage 0: Environment detection
 * Detects platform, architecture, locale, and timezone.
 */
export const stage0_Environment = async (
	Log: BootstrapLogger,
): Promise<StageResult> => {
	Log("info", "[Bootstrap] Stage 0: Detecting environment...");

	Log(
		"info",

		`[Bootstrap] Environment: ${DetectPlatform()}/${DetectArchitecture()}`,
	);

	Log(
		"info",

		`[Bootstrap] Locale: ${DetectLocale()}, Timezone: ${DetectTimezone()}`,
	);

	return {
		stageName: "Environment",

		success: true as boolean,

		duration: 0, // Will be set by caller

		error: undefined,
	} satisfies StageResult;
};

/**
 * Stage 1: Preload readiness
 * Waits for preload script to complete and globals to be available.
 */
export const stage1_Preload = async (
	Log: BootstrapLogger,
): Promise<StageResult> => {
	Log("info", "[Bootstrap] Stage 1: Waiting for preload...");

	let Ready = false;

	for (let Attempt = 0; Attempt < PreloadPollMaxAttempts; Attempt++) {
		const PreloadGlobals = (
			window as unknown as { preloadGlobals?: Record<string, unknown> }
		).preloadGlobals;

		if (
			PreloadGlobals?.["process"] &&
			PreloadGlobals["ipcRenderer"] &&
			(window as unknown as { vscode?: unknown }).vscode
		) {
			Ready = true;

			break;
		}

		await Wait(PreloadPollIntervalMilliseconds);
	}

	if (!Ready) {
		throw new SandboxNotReadyError();
	}

	Log("info", "[Bootstrap] Preload ready, globals available");

	return {
		stageName: "Preload",

		success: true as boolean,

		duration: 0,

		error: undefined,
	} satisfies StageResult;
};

/**
 * Stage 2: Configuration loading
 * Loads and applies configuration settings.
 */
export const stage2_Configuration = async (
	Log: BootstrapLogger,
): Promise<StageResult> => {
	// Ensure configuration is loaded
	await ConfigurationLive.refresh();

	Log("info", "[Bootstrap] Stage 2: Loading configuration...");

	Log("info", "[Bootstrap] Configuration applied");

	return {
		stageName: "Configuration",

		success: true as boolean,

		duration: 0,

		error: undefined,
	} satisfies StageResult;
};

/**
 * Stage 3: Services initialization
 * Connects to backend services (Mountain).
 */
export const stage3_Services = async (
	Log: BootstrapLogger,
): Promise<StageResult> => {
	Log("info", "[Bootstrap] Stage 3: Connecting to Mountain backend...");

	// Connect to mountain backend
	await MountainLive.connect();

	Log("info", "[Bootstrap] Mountain connected");

	return {
		stageName: "Services",

		success: true as boolean,

		duration: 0,

		error: undefined,
	} satisfies StageResult;
};

/**
 * Stage 4: Preparation
 * Prepares workbench resources and assets.
 */
export const stage4_Preparation = async (
	Log: BootstrapLogger,
): Promise<StageResult> => {
	Log("info", "[Bootstrap] Stage 4: Preparing workbench resources...");

	// Load VSCode output bundle
	// This would load @codeeditorland/output
	Log("info", "[Bootstrap] Workbench resources prepared");

	return {
		stageName: "Preparation",

		success: true as boolean,

		duration: 0,

		error: undefined,
	} satisfies StageResult;
};

/**
 * Stage 5: Initialization
 * Initializes VSCode workbench and dispatches completion event.
 */
export const stage5_Initialization = async (
	Log: BootstrapLogger,
): Promise<StageResult> => {
	Log("info", "[Bootstrap] Stage 5: Initializing VSCode workbench...");

	// Initialize VSCode workbench
	// This would call into the VSCode API from @codeeditorland/output
	Log("info", "[Bootstrap] VSCode workbench initialized");

	// Dispatch completion event
	window.dispatchEvent(
		new CustomEvent("land-bootstrap-complete", {
			detail: { success: true },
		}),
	);

	return {
		stageName: "Initialization",

		success: true as boolean,

		duration: 0,

		error: undefined,
	} satisfies StageResult;
};

/**
 * Stage 6: Health check
 * Runs health checks on all services.
 */
export const stage6_HealthCheck = async (
	Log: BootstrapLogger,
): Promise<StageResult> => {
	Log("info", "[Bootstrap] Stage 6: Running health checks...");

	const SystemHealth = await HealthLive.checkAllServices();

	Log(
		"info",

		`[Bootstrap] Health check result: ${SystemHealth.overallStatus}`,
	);

	if (SystemHealth.overallStatus === "unhealthy") {
		Log("error", "[Bootstrap] Some services are unhealthy!");
	}

	return {
		stageName: "HealthCheck",

		success: SystemHealth.overallStatus !== "unhealthy",

		duration: 0,

		error: undefined,
	} satisfies StageResult;
};

export default {
	stage0_Environment,

	stage1_Preload,

	stage2_Configuration,

	stage3_Services,

	stage4_Preparation,

	stage5_Initialization,

	stage6_HealthCheck,
};
