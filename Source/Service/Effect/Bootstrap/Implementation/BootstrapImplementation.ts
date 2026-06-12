/**
 * @module Effect/Bootstrap/Implementation/BootstrapImplementation
 * @description
 * Main implementation of Bootstrap service with stage orchestration.
 * Plain async pipeline: stages run sequentially, each failure is captured
 * into its StageResult instead of aborting the run.
 * @see {@link Effect/Bootstrap/Interface/BootstrapService} Service interface
 * @category Implementation
 */

import type { BootstrapService } from "../Interface/BootstrapService.js";
import type {
	BootstrapLogger,
	BootstrapResult,
	StageResult,
} from "../Type/BootstrapType.js";
import {
	stage0_Environment,
	stage1_Preload,
	stage2_Configuration,
	stage3_Services,
	stage4_Preparation,
	stage5_Initialization,
	stage6_HealthCheck,
} from "./BootstrapStage.js";

// ============================================================================
// Live Implementation
// ============================================================================

// Mirrors the observable side effect of the Telemetry service's log method
// without pulling in its Effect-typed surface.
const DefaultLogger: BootstrapLogger = (Level, Message) => {
	if (typeof performance !== "undefined") {
		try {
			performance.mark(`land:telemetry:${Level}:${Message.slice(0, 80)}`);
		} catch {}
	}
};

/**
 * Creates the main bootstrap orchestration service.
 */
export const makeBootstrap = (
	Log: BootstrapLogger = DefaultLogger,
): BootstrapService => ({
	run: async (Options) => {
		const StartTime = Date.now();

		const { skipHealthCheck = false, debugMode = false } = Options ?? {};

		Log(
			"info",

			"[Bootstrap] ===============================================",
		);

		Log("info", "[Bootstrap] Wind VSCode Workbench Bootstrap");

		Log("info", `[Bootstrap] Debug mode: ${debugMode}`);

		Log(
			"info",

			"[Bootstrap] ===============================================",
		);

		const Stages = [
			stage0_Environment,
			stage1_Preload,
			stage2_Configuration,
			stage3_Services,
			stage4_Preparation,
			stage5_Initialization,
			...(skipHealthCheck ? [] : [stage6_HealthCheck]),
		];

		const Results: StageResult[] = [];

		for (const Stage of Stages) {
			const StageStartTime = Date.now();

			let Result: StageResult;

			try {
				const Outcome = await Stage(Log);

				Result = {
					...Outcome,
					duration: Date.now() - StageStartTime,
				};
			} catch (FailCause) {
				const ErrorObj =
					FailCause instanceof Error
						? FailCause
						: new Error(String(FailCause));

				Result = {
					stageName: "Unknown",
					success: false as boolean,
					duration: Date.now() - StageStartTime,
					error: ErrorObj,
				} satisfies StageResult;
			}

			Results.push(Result);
		}

		const EndTime = Date.now();

		const TotalDuration = EndTime - StartTime;

		const AllSuccess = Results.every((R) => R.success);

		Log(
			"info",

			"[Bootstrap] ===============================================",
		);

		Log(
			"info",

			`[Bootstrap] ${AllSuccess ? "✓ Bootstrap completed successfully" : "✗ Bootstrap failed"}`,
		);

		Log("info", `[Bootstrap] Total duration: ${TotalDuration}ms`);

		Log(
			"info",

			"[Bootstrap] ===============================================",
		);

		if (!AllSuccess) {
			const FailedStages = Results.filter((R) => !R.success);

			Log("error", "[Bootstrap] Failed stages:");

			for (const Failed of FailedStages) {
				Log(
					"error",

					`[Bootstrap]   - ${Failed.stageName}: ${Failed.error?.message || "Unknown error"}`,
				);
			}
		}

		return {
			success: AllSuccess,
			totalDuration: TotalDuration,
			stages: Results,
			error: AllSuccess ? undefined : new Error("Bootstrap failed"),
		} satisfies BootstrapResult;
	},
});

/**
 * Live Bootstrap service.
 * Orchestrates all initialization stages for the VSCode workbench.
 */
export const BootstrapLive: BootstrapService = makeBootstrap();

export default BootstrapLive;
