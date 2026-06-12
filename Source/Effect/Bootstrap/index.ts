// Convenience export for quick bootstrap execution

import { Effect, Layer } from "effect";
import TelemetryLive from "../Telemetry/Layer/TelemetryLive.js";
import { BootstrapLive } from "./Implementation/BootstrapImplementation.js";
import { BootstrapTag } from "./Tag/BootstrapTag.js";
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
 * import { Bootstrap, BootstrapLive, BootstrapTag } from "./Effect/Bootstrap/index.js";
 *
 * // Using the service
 * const program = Effect.gen(function* () {
 *   const bootstrap = yield* BootstrapTag;
 *   const result = yield* bootstrap.run({ debugMode: true });
 *   return result;
 * });
 *
 * // Providing the layer
 * const runnable = program.pipe(Effect.provide(BootstrapLive));
 * ```
 *
 * @see {@link Effect/Bootstrap/Interface/BootstrapService} Service interface
 * @see {@link Effect/Bootstrap/Implementation/BootstrapImplementation} Live implementation
 * @see [Effect-TS Documentation](https://effect.website/docs/guide/context)
 * @category Service
 */

// Live implementation layer
export { BootstrapLive } from "./Implementation/BootstrapImplementation.js";
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
// Mock implementation layer
export { BootstrapMock, makeMockBootstrap } from "./Layer/BootstrapMock.js";
// Service tag
export { BootstrapTag } from "./Tag/BootstrapTag.js";
// Type definitions
export type {
	BootstrapOptions,
	BootstrapResult,
	StageResult,
} from "./Type/BootstrapType.js";

// Minimal layer: only Telemetry + Bootstrap. Individual stages fail gracefully
// when their dependencies (IPC, Mountain, Environment, etc.) are unavailable.
// The full layer stack (ElectronBaseLayer) requires IPC which may die if
// __TAURI__ isn't injected yet. The Bootstrap is diagnostic, not critical path.
const BootstrapRunLayer = TelemetryLive.pipe(Layer.provideMerge(BootstrapLive));

export const runBootstrap = async (
	options?: BootstrapOptions,
): Promise<BootstrapResult> =>
	Effect.runPromise(
		Effect.gen(function* () {
			const bootstrap = yield* BootstrapTag;

			return yield* bootstrap.run(options);
		}).pipe(Effect.provide(BootstrapRunLayer)),
	);
