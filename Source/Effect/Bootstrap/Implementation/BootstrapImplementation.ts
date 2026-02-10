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
	run: (options) =>
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
				let result: StageResult;
				try {
					// @ts-expect-error - Effect stages have different requirements that runtime handles correctly
					const stageResult = yield* Effect.suspend(() => stage) as any;
					result = { ...stageResult, duration: Date.now() - stageStartTime };
				} catch (e) {
					const error = e instanceof Error ? e : new Error(String(e));
					result = {
						stageName: "Unknown",
						success: false as boolean,
						duration: Date.now() - stageStartTime,
						error,
					} satisfies StageResult;
				}
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

/**
 * Live implementation layer for Bootstrap service.
 * Orchestrates all initialization stages for the VSCode workbench.
 */
export const BootstrapLive = Layer.effect(
	BootstrapTag,
	Effect.succeed(makeBootstrap()),
);

export default BootstrapLive;
