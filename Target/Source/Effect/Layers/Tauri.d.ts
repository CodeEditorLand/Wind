/**
 * @module Effect/Layers/Tauri
 * @description
 * Complete Effect layer stack for Tauri runtime.
 * Composes all atomic services into a runnable layer.
 */
import { Layer } from "effect";
/**
 * Base Tauri layer stack.
 * Provides: Sandbox + IPC + Configuration + Telemetry + Mountain
 *
 * Use this when you need manual control over configuration sync.
 */
export declare const TauriBaseLayer: Layer.Layer<never, any, any>;
/**
 * Full Tauri layer stack with automatic configuration sync.
 * Provides: All base services + reactive Mountain-driven config updates
 *
 * This is the standard layer for Wind production builds.
 */
export declare const TauriLiveLayer: Layer.Layer<never, any, any>;
/**
 * Tauri layer with maximum telemetry and logging.
 * Useful for debugging and development.
 */
export declare const TauriDevLayer: Layer.Layer<never, any, any>;
export default TauriLiveLayer;
//# sourceMappingURL=Tauri.d.ts.map