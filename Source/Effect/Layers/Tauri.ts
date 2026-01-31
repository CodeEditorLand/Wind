/**
 * @module Effect/Layers/Tauri
 * @description
 * Complete Effect layer stack for Tauri runtime.
 * Composes all atomic services into a runnable layer.
 */

import { Layer } from "effect";

import {
	ConfigurationLive,
	ConfigurationWithSyncLive,
} from "../Configuration.js";
import { IPCTauriLive } from "../IPC.js";
import { MountainLive } from "../Mountain.js";
import { SandboxLive } from "../Sandbox.js";
import { TelemetryLive } from "../Telemetry.js";

// ============================================================================
// Base Tauri Layer (without config sync)
// ============================================================================

/**
 * Base Tauri layer stack.
 * Provides: Sandbox + IPC + Configuration + Telemetry + Mountain
 *
 * Use this when you need manual control over configuration sync.
 */
export const TauriBaseLayer = Layer.empty.pipe(
	Layer.provide(SandboxLive),
	Layer.provide(IPCTauriLive),
	Layer.provide(TelemetryLive),
	Layer.provide(ConfigurationLive),
	Layer.provide(MountainLive),
);

// ============================================================================
// Full Tauri Layer (with auto config sync)
// ============================================================================

/**
 * Full Tauri layer stack with automatic configuration sync.
 * Provides: All base services + reactive Mountain-driven config updates
 *
 * This is the standard layer for Wind production builds.
 */
export const TauriLiveLayer = Layer.empty.pipe(
	Layer.provide(SandboxLive),
	Layer.provide(IPCTauriLive),
	Layer.provide(TelemetryLive),
	Layer.provide(ConfigurationWithSyncLive),
	Layer.provide(MountainLive),
);

// ============================================================================
// Tauri Development Layer (with verbose logging)
// ============================================================================

/**
 * Tauri layer with maximum telemetry and logging.
 * Useful for debugging and development.
 */
export const TauriDevLayer = Layer.empty.pipe(
	Layer.provide(SandboxLive),
	Layer.provide(IPCTauriLive),
	Layer.provide(TelemetryLive),
	Layer.provide(ConfigurationWithSyncLive),
	Layer.provide(MountainLive),
);

// Export default for convenience
export default TauriLiveLayer;
