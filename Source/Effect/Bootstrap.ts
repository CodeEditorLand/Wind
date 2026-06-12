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
 * import { runBootstrap } from "./Effect/Bootstrap.js";
 *
 * // New (recommended):
 * import { runBootstrap } from "./Effect/Bootstrap/index.js";
 * ```
 */

// Re-export from atomic modules for backward compatibility
export {
	type BootstrapLogger,
	type BootstrapOptions,
	type StageResult,
	type BootstrapResult,
	type BootstrapService,
	stage0_Environment,
	stage1_Preload,
	stage2_Configuration,
	stage3_Services,
	stage4_Preparation,
	stage5_Initialization,
	stage6_HealthCheck,
	BootstrapLive,
	BootstrapMock,
	makeBootstrap,
	makeMockBootstrap,
	runBootstrap,
} from "./Bootstrap/index.js";
