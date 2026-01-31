/**
 * @module Bootstrap/Stages/Stage0-Environment
 * @description
 * Stage 0: Environment Detection and Validation
 *
 * EXECUTION ORDER: First stage (0/6), executes before all other stages
 *
 * RESPONSIBILITIES:
 * - Detect execution platform (Tauri/Electron/Browser)
 * - Detect operating mode (Development/Production)
 * - Validate runtime environment capabilities
 * - Initialize global bootstrap flags
 * - Collect environment performance metrics
 * - Provide environment diagnostics for debugging
 *
 * ARCHITECTURE OVERVIEW:
 * This stage establishes the foundation for all subsequent bootstrap stages.
 * It performs minimal environment detection to determine platform-specific
 * code paths and validate that required browser/Desktop APIs are available.
 *
 * The stage follows Microsoft VSCode's environment detection pattern:
 * 1. Detect platform capabilities first (least likely to fail)
 * 2. Detect mode/flags second (environment-dependent)
 * 3. Validate required APIs third (may throw errors)
 * 4. Collect metrics and diagnostics last (non-critical)
 *
 * DEPENDENCIES:
 * - No dependencies on other bootstrap stages
 * - Relies only on browser/Desktop APIs
 * - Services are not yet available at this stage
 *
 * Microsoft VSCode Source References:
 * - src/vs/base/common/platform.ts - Platform detection logic
 * - src/vs/base/node/languagePacks.ts - Language detection
 * - src/vs/platform/environment/common/environmentService.ts - Environment service
 * - src/vs/workbench/common/contextKeys.ts - Context key initialization
 * - src/vs/base/browser/browser.ts - Browser capability detection
 *
 * TODO:
 * - Add telemetry opt-in detection from localStorage
 * - Implement feature flag system for A/B testing
 * - Add CPU/memory profiling hooks for development
 * - Support remote debugging bridge detection
 * - Add accessibility API validation
 * - Implement offline capability detection
 * - Add WebGL/WebGPU capability detection for graphics features
 * - Support custom window dimensions from URL parameters
 * - Add user agent parsing for detailed browser version tracking
 * - Implement progressive web app (PWA) detection
 * - Add network quality detection (4G/3G/2G/offline)
 * - Implement locale-specific date/number format detection
 * - Add color scheme detection (light/dark/high-contrast)
 * - Support multi-monitor detection for window positioning
 * - Add keyboard layout detection for shortcuts
 * - Implement touch/gesture capability detection
 * - Add speech recognition API detection
 * - Support custom protocol handlers (vscode://)
 * - Add file system access API validation
 * - Implement clipboard API validation
 * - Add drag-and-drop capability detection
 * - Support fullscreen API detection
 * - Add picture-in-picture API validation
 * - Implement media device enumeration (camera/mic)
 * - Add geolocation API detection
 * - Support notification API validation
 * - Add push API detection
 * - Implement service worker detection
 * - Add WebAssembly feature detection
 * - Support SharedArrayBuffer validation
 * - Add Web Worker capability detection
 * - Implement requestIdleCallback detection
 * - Add IntersectionObserver validation
 * - Support ResizeObserver detection
 * - Add MutationObserver validation
 * - Implement PerformanceObserver detection
 * - Add requestAnimationFrame detection
 * - Support custom CSS properties detection
 * - Add Container Queries detection
 * - Implement CSS Grid detection
 * - Add CSS Flexbox detection
 * - Support CSS Variables detection
 * - Add ES Modules detection
 * - Implement async/await detection
 * - Add BigInt detection
 * - Support Optional Chaining detection
 * - Add Nullish Coalescing detection
 * - Implement Top-Level Await detection
 */
import type { StageResult, Platform, Mode } from '../Types/index.js';
export declare class EnvironmentStage {
    static readonly STAGE_NAME: "Environment";
    /**
     * Execute the environment detection stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Detect platform (Tauri/Browser)
     */
    private static detectPlatform;
    /**
     * Detect mode (Development/Production)
     */
    private static detectMode;
    /**
     * Validate runtime environment
     */
    private static validateRuntimeEnvironment;
    /**
     * Validate Tauri environment
     */
    private static validateTauriEnvironment;
    /**
     * Validate browser environment
     */
    private static validateBrowserEnvironment;
    /**
     * Gather comprehensive environment data with metrics
     */
    private static gatherEnvironmentData;
    /**
     * Collect performance metrics for diagnostics
     */
    private static collectPerformanceMetrics;
    /**
     * Detect browser capabilities for feature detection
     */
    private static detectBrowserCapabilities;
    /**
     * Get viewport and display metrics
     */
    private static getViewportMetrics;
    /**
     * Get network information if available
     */
    private static getNetworkInformation;
    /**
     * Get storage estimation for quota tracking
     */
    private static getStorageEstimation;
    /**
     * Set up global flags
     */
    private static setupGlobalFlags;
    /**
     * Get platform from globals
     */
    static getPlatform(): Platform;
    /**
     * Get mode from globals
     */
    static getMode(): Mode;
    /**
     * Check if debug mode is enabled
     */
    static isDebugMode(): boolean;
}
//# sourceMappingURL=Stage0-Environment.d.ts.map