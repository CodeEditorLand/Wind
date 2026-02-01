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
import { EnvironmentLive } from "../Environment.js";
import { HealthLive } from "../Health.js";
import { BootstrapLive } from "../Bootstrap.js";
import { LiveClipboardServiceLayer as ClipboardLive } from "../Clipboard.js";
import { MountainSyncLive } from "../MountainSync.js";

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
	Layer.provide(EnvironmentLive),
	Layer.provide(ClipboardLive),
	Layer.provide(TelemetryLive),
	Layer.provide(ConfigurationLive),
	Layer.provide(MountainLive),
	Layer.provide(MountainSyncLive),
	Layer.provide(HealthLive),
	Layer.provide(BootstrapLive),
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
	Layer.provide(EnvironmentLive),
	Layer.provide(ClipboardLive),
	Layer.provide(TelemetryLive),
	Layer.provide(ConfigurationWithSyncLive),
	Layer.provide(MountainLive),
	Layer.provide(MountainSyncLive),
	Layer.provide(HealthLive),
	Layer.provide(BootstrapLive),
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
	Layer.provide(EnvironmentLive),
	Layer.provide(ClipboardLive),
	Layer.provide(TelemetryLive),
	Layer.provide(ConfigurationWithSyncLive),
	Layer.provide(MountainLive),
	Layer.provide(MountainSyncLive),
	Layer.provide(HealthLive),
	Layer.provide(BootstrapLive),
);

// Export default for convenience
export default TauriLiveLayer;
