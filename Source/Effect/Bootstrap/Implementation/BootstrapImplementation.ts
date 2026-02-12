/**
 * @module Effect/Bootstrap/Implementation/BootstrapImplementation
 * @description
 * Main implementation of Bootstrap service with stage orchestration.
 * Provides production-ready implementation with telemetry support.
 * @see {@link Effect/Bootstrap/Interface/BootstrapService} Service interface
 * @see [Effect-TS Layers](https://effect.website/docs/guide/layer)
 * @category Implementation
 */

import { Effect, Layer } from "effect";

import { BootstrapTag } from "../Tag/BootstrapTag.js";
import type { BootstrapService } from "../Interface/BootstrapService.js";
import type { BootstrapOptions, BootstrapResult, StageResult } from "../Type/BootstrapType.js";
import { Telemetry } from "../../Telemetry.js";
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

/**
 * Creates the main bootstrap orchestration function.
 */
const makeBootstrap = (): BootstrapService => ({
	run: (Options) =>
	Effect.gen(function* () {
		const TelemetryService = yield* Telemetry;

		const StartTime = Date.now();
		const { skipHealthCheck = false, debugMode = false } = Options ?? {};

		TelemetryService.log("info", "[Bootstrap] ===============================================");
		TelemetryService.log("info", "[Bootstrap] Wind VSCode Workbench Bootstrap");
		TelemetryService.log("info", "[Bootstrap] Debug mode: " + debugMode);
		TelemetryService.log("info", "[Bootstrap] ===============================================");

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
				// @ts-expect-error - Effect stages have different requirements that runtime handles correctly
				const StageResult = yield* Effect.suspend(() => Stage) as any;
				Result = { ...StageResult, duration: Date.now() - StageStartTime };
			} catch (E) {
				const Error = E instanceof Error ? E : new Error(String(E));
				Result = {
					stageName: "Unknown",
					success: false as boolean,
					duration: Date.now() - StageStartTime,
					error: Error,
				} satisfies StageResult;
			}
			Results.push(Result);
		}

		const EndTime = Date.now();
		const TotalDuration = EndTime - StartTime;
		const AllSuccess = Results.every((R) => R.success);

		TelemetryService.log("info", "[Bootstrap] ===============================================");
		TelemetryService.log(
			"info",
			`[Bootstrap] ${AllSuccess ? "✓ Bootstrap completed successfully" : "✗ Bootstrap failed"}`,
		);
		TelemetryService.log("info", `[Bootstrap] Total duration: ${TotalDuration}ms`);
		TelemetryService.log("info", "[Bootstrap] ===============================================");

		if (!AllSuccess) {
			const FailedStages = Results.filter((R) => !R.success);
			TelemetryService.log("error", "[Bootstrap] Failed stages:");
			for (const Failed of FailedStages) {
				TelemetryService.log("error", `[Bootstrap]   - ${Failed.stageName}: ${Failed.error?.message || "Unknown error"}`);
			}
		}

		return {
			success: AllSuccess,
			totalDuration: TotalDuration,
			stages: Results,
			error: AllSuccess ? undefined : new Error("Bootstrap failed"),
		} satisfies BootstrapResult;
	}),
});

/**
 * Live implementation layer for Bootstrap service.
 * Orchestrates all initialization stages for the VSCode workbench.
 */
export const BootstrapLive = Layer.effect(
	BootstrapTag,
	Effect.succeed(makeBootstrap()),
);

export default BootstrapLive;
