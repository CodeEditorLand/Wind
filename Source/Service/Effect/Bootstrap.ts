/**
 * @module Effect/Bootstrap
 * @description
 * Bootstrap orchestration as a plain async stage pipeline.
 *
 * @deprecated This file is maintained for backward compatibility.
 * Please import from {@link ./Bootstrap/index.ts} instead.
 *
 * @example
 * ```ts
 * // Old (still works):
 * import { runBootstrap } from "./Service/Bootstrap.js";
 *
 * // New (recommended):
 * import { runBootstrap } from "./Service/Bootstrap/index.js";
 * ```
 */

// Re-export from atomic modules for backward compatibility
export {
	BootstrapLive,
	type BootstrapLogger,
	BootstrapMock,
	type BootstrapOptions,
	type BootstrapResult,
	type BootstrapService,
	makeBootstrap,
	makeMockBootstrap,
	runBootstrap,
	type StageResult,
	stage0_Environment,
	stage1_Preload,
	stage2_Configuration,
	stage3_Services,
	stage4_Preparation,
	stage5_Initialization,
	stage6_HealthCheck,
} from "./Bootstrap/index.js";
