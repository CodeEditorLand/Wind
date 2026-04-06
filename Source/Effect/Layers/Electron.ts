/**
 * @module Effect/Layers/Electron
 * @description
 * Complete Effect layer stack for Electron runtime (Sky).
 * Composes all atomic services into a runnable layer using Electron IPC.
 */

import { Layer } from "effect";

import {
	ConfigurationLive,
	ConfigurationWithSyncLive,
} from "../Configuration.js";
import { IPCElectronLive } from "../IPC.js";
import { MountainLive } from "../Mountain.js";
import { SandboxLive } from "../Sandbox.js";
import { TelemetryLive } from "../Telemetry.js";

// ============================================================================
// Base Electron Layer (without config sync)
// ============================================================================

/**
 * Base Electron layer stack.
 * Provides: Sandbox + IPC + Configuration + Telemetry + Mountain
 *
 * Use this when you need manual control over configuration sync.
 */
export const ElectronBaseLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxLive))
	.pipe(Layer.provideMerge(IPCElectronLive))
	.pipe(Layer.provideMerge(TelemetryLive))
	.pipe(Layer.provideMerge(ConfigurationLive))
	.pipe(Layer.provideMerge(MountainLive));

// ============================================================================
// Full Electron Layer (with auto config sync)
// ============================================================================

/**
 * Full Electron layer stack with automatic configuration sync.
 * Provides: All base services + reactive Mountain-driven config updates
 *
 * This is the standard layer for Sky (Electron) builds.
 */
export const ElectronLiveLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxLive))
	.pipe(Layer.provideMerge(IPCElectronLive))
	.pipe(Layer.provideMerge(TelemetryLive))
	.pipe(Layer.provideMerge(ConfigurationWithSyncLive))
	.pipe(Layer.provideMerge(MountainLive));

// ============================================================================
// Electron Development Layer (with verbose logging)
// ============================================================================

/**
 * Electron layer with maximum telemetry and logging.
 * Useful for debugging and development in Electron environment.
 */
export const ElectronDevLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxLive))
	.pipe(Layer.provideMerge(IPCElectronLive))
	.pipe(Layer.provideMerge(TelemetryLive))
	.pipe(Layer.provideMerge(ConfigurationWithSyncLive))
	.pipe(Layer.provideMerge(MountainLive));

// Export default for convenience
export default ElectronLiveLayer;
