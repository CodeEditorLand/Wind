// Convenience export for quick bootstrap execution

import { BootstrapLive } from "./Implementation/BootstrapImplementation.js";
import type {
	BootstrapOptions,
	BootstrapResult,
} from "./Type/BootstrapType.js";

/**
 * @module Effect/Bootstrap
 * @description
 * Main re-export module for Bootstrap service.
 * Provides atomic exports for bootstrap orchestration.
 *
 * @example
 * ```ts
 * import { runBootstrap } from "./Effect/Bootstrap/index.js";
 *
 * const result = await runBootstrap({ debugMode: true });
 * ```
 *
 * @see {@link Effect/Bootstrap/Interface/BootstrapService} Service interface
 * @see {@link Effect/Bootstrap/Implementation/BootstrapImplementation} Live implementation
 * @category Service
 */

// Live implementation
export {
	BootstrapLive,
	makeBootstrap,
} from "./Implementation/BootstrapImplementation.js";

// Stage implementations
export {
	stage0_Environment,
	stage1_Preload,
	stage2_Configuration,
	stage3_Services,
	stage4_Preparation,
	stage5_Initialization,
	stage6_HealthCheck,
} from "./Implementation/BootstrapStage.js";

// Service interface
export type { BootstrapService } from "./Interface/BootstrapService.js";

// Mock implementation
export { BootstrapMock, makeMockBootstrap } from "./Layer/BootstrapMock.js";

// Type definitions
export type {
	BootstrapLogger,
	BootstrapOptions,
	BootstrapResult,
	StageResult,
} from "./Type/BootstrapType.js";

// Individual stages fail gracefully when their dependencies (IPC, Mountain,
// Environment, etc.) are unavailable. The Bootstrap is diagnostic, not
// critical path.
export const runBootstrap = async (
	options?: BootstrapOptions,
): Promise<BootstrapResult> => BootstrapLive.run(options);
