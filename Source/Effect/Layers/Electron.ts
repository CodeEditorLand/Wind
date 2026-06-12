/**
 * @module Effect/Layers/Electron
 * @description
 * Complete Effect layer stack for Electron runtime (Sky).
 * Composes the remaining Effect-typed services using Electron IPC.
 * Configuration, Mountain, and IPC are plain services exported from their
 * Implementation modules and no longer appear in the layer stack.
 */

import { Layer } from "effect";

import { SandboxLive } from "../Sandbox.js";
import { TelemetryLive } from "../Telemetry.js";

// ============================================================================
// Base Electron Layer (without config sync)
// ============================================================================

/**
 * Base Electron layer stack.
 * Provides: Sandbox + Telemetry
 *
 * IPC is a plain object — import TauriIPCLive directly.
 * Use this when you need manual control over configuration sync.
 */
export const ElectronBaseLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxLive))
	.pipe(Layer.provideMerge(TelemetryLive));

// ============================================================================
// Full Electron Layer (with auto config sync)
// ============================================================================

/**
 * Full Electron layer stack.
 * Mountain-driven configuration sync runs inside the plain Mountain
 * service while connected.
 *
 * This is the standard layer for Sky (Electron) builds.
 */
export const ElectronLiveLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxLive))
	.pipe(Layer.provideMerge(TelemetryLive));

// ============================================================================
// Electron Development Layer (with verbose logging)
// ============================================================================

/**
 * Electron layer with maximum telemetry and logging.
 * Useful for debugging and development in Electron environment.
 */
export const ElectronDevLayer = Layer.empty
	.pipe(Layer.provideMerge(SandboxLive))
	.pipe(Layer.provideMerge(TelemetryLive));

// Export default for convenience
export default ElectronLiveLayer;
