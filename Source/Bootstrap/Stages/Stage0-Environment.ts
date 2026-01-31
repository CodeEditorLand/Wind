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

import type { StageResult, EnvironmentData, Platform, Mode } from '../Types/index.js';
import { StatusReporter } from '../Core/StatusReporter.js';
import { ErrorHandler } from '../Core/ErrorHandler.js';

export class EnvironmentStage {
  static readonly STAGE_NAME = 'Environment' as const;

  /**
   * Execute the environment detection stage
   */
  static async execute(): Promise<StageResult> {
    const startTime = performance.now();
    const reporter = StatusReporter.getInstance();
    const errorHandler = ErrorHandler.getInstance();

    try {
      // Update status to running
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'running',
        message: 'Detecting environment...',
        progress: 0
      });

      console.log('[Stage 0] Starting environment detection...');

      // Detect platform
      const platform = this.detectPlatform();
      console.log(`[Stage 0] ✓ Platform detected: ${platform}`);

      // Detect mode
      const mode = this.detectMode();
      console.log(`[Stage 0] ✓ Mode detected: ${mode}`);

      // Validate runtime environment
      await this.validateRuntimeEnvironment(platform);
      console.log('[Stage 0] ✓ Runtime environment validated');

      // Gather environment data
      const environmentData = this.gatherEnvironmentData(platform, mode);
      console.log('[Stage 0] ✓ Environment data gathered');

      // Set up global flags
      this.setupGlobalFlags(environmentData);
      console.log('[Stage 0] ✓ Global flags set');

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: `Environment ready (${platform}, ${mode})`,
        progress: 14.3, // 1/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: environmentData
      };

    } catch (error) {
      const duration = performance.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Handle error
      await errorHandler.handle(
        this.STAGE_NAME,
        errorObj,
        'critical',
        { 
          stage: 'Environment Detection',
          suggestion: 'Check browser compatibility and console for errors'
        }
      );

      return {
        success: false,
        stage: this.STAGE_NAME,
        duration,
        error: errorObj,
        critical: true
      };
    }
  }

  /**
   * Detect platform (Tauri/Browser)
   */
  private static detectPlatform(): Platform {
    console.log('[Stage 0] Detecting platform...');

    // Check if running in Tauri
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      console.log('[Stage 0] ✓ Running in Tauri');
      return 'tauri';
    }

    // Check if running in Electron (future compatibility)
    if (typeof window !== 'undefined' && (window as any).process?.versions?.electron) {
      console.log('[Stage 0] ✓ Running in Electron');
      return 'tauri'; // Treat Electron as Tauri for now
    }

    // Default to browser
    console.log('[Stage 0] ✓ Running in Browser');
    return 'browser';
  }

  /**
   * Detect mode (Development/Production)
   */
  private static detectMode(): Mode {
    console.log('[Stage 0] Detecting mode...');

    // Check for development flag
    if (typeof window !== 'undefined' && (window as any).__BOOTSTRAP_DEBUG__) {
      console.log('[Stage 0] ✓ Development mode');
      return 'development';
    }

    // Check for production indicators
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('[Stage 0] ✓ Development mode (localhost)');
      return 'development';
    }

    // Default to production
    console.log('[Stage 0] ✓ Production mode');
    return 'production';
  }

  /**
   * Validate runtime environment
   */
  private static async validateRuntimeEnvironment(platform: Platform): Promise<void> {
    console.log('[Stage 0] Validating runtime environment...');

    // Check for required APIs
    const requiredApis = [
      'window',
      'document',
      'localStorage',
      'performance',
      'console'
    ];

    const missingApis: string[] = [];

    for (const api of requiredApis) {
      if (!(api in globalThis)) {
        missingApis.push(api);
        console.warn(`[Stage 0] ⚠ API not available: ${api}`);
      }
    }

    if (missingApis.length > 0) {
      throw new Error(`Missing required APIs: ${missingApis.join(', ')}`);
    }

    // Platform-specific validation
    if (platform === 'tauri') {
      await this.validateTauriEnvironment();
    } else {
      await this.validateBrowserEnvironment();
    }

    console.log('[Stage 0] ✓ Runtime environment validated');
  }

  /**
   * Validate Tauri environment
   */
  private static async validateTauriEnvironment(): Promise<void> {
    console.log('[Stage 0] Validating Tauri environment...');

    const tauri = (window as any).__TAURI__;
    
    if (!tauri) {
      throw new Error('Tauri API not available');
    }

    // Check for required Tauri modules
    const requiredModules = ['core', 'window', 'app'];
    const missingModules: string[] = [];

    for (const module of requiredModules) {
      if (!tauri[module]) {
        missingModules.push(module);
        console.warn(`[Stage 0] ⚠ Tauri module not available: ${module}`);
      }
    }

    if (missingModules.length > 0) {
      throw new Error(`Missing Tauri modules: ${missingModules.join(', ')}`);
    }

    console.log('[Stage 0] ✓ Tauri environment validated');
  }

  /**
   * Validate browser environment
   */
  private static async validateBrowserEnvironment(): Promise<void> {
    console.log('[Stage 0] Validating browser environment...');

    // Check for modern browser features
    const requiredFeatures = [
      'Promise',
      'fetch',
      'URL',
      'URLSearchParams',
      'TextEncoder',
      'TextDecoder'
    ];

    const missingFeatures: string[] = [];

    for (const feature of requiredFeatures) {
      if (!(feature in globalThis)) {
        missingFeatures.push(feature);
        console.warn(`[Stage 0] ⚠ Feature not available: ${feature}`);
      }
    }

    if (missingFeatures.length > 0) {
      throw new Error(`Missing browser features: ${missingFeatures.join(', ')}`);
    }

    console.log('[Stage 0] ✓ Browser environment validated');
  }

  /**
   * Gather comprehensive environment data with metrics
   */
  private static gatherEnvironmentData(platform: Platform, mode: Mode): EnvironmentData {
    console.log('[Stage 0] Gathering environment data with metrics...');

    const environmentData: EnvironmentData = {
      platform,
      mode,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      // Add timestamp for when environment was captured
      timestamp: Date.now()
    };

    // Add performance metrics if available
    const metrics = this.collectPerformanceMetrics();
    if (metrics) {
      (environmentData as any).performanceMetrics = metrics;
    }

    // Add browser capabilities
    const capabilities = this.detectBrowserCapabilities();
    (environmentData as any).capabilities = capabilities;

    // Add visual viewport data
    const viewport = this.getViewportMetrics();
    if (viewport) {
      (environmentData as any).viewport = viewport;
    }

    // Add network information if available
    const network = this.getNetworkInformation();
    if (network) {
      (environmentData as any).network = network;
    }

    // Add storage estimation
    const storage = this.getStorageEstimation();
    if (storage) {
      (environmentData as any).storage = storage;
    }

    console.log('[Stage 0] ✓ Environment data gathered with metrics');
    return environmentData;
  }

  /**
   * Collect performance metrics for diagnostics
   */
  private static collectPerformanceMetrics(): any {
    console.log('[Stage 0] Collecting performance metrics...');

    const metrics: any = {};

    // Memory information (Chrome only)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      metrics.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
      console.log(`[Stage 0] Memory: ${metrics.memory.usedJSHeapSize / 1024 / 1024}MB used`);
    }

    // Timing information (deprecated but still available in some browsers)
    if ('timing' in performance) {
      const timing = performance.timing;
      metrics.timing = {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        domComplete: timing.domComplete - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart
      };
      console.log(`[Stage 0] Page load time: ${metrics.timing.loadComplete}ms`);
    }

    // Navigation information
    if ('navigation' in performance) {
      const nav = performance.getEntriesByType('navigation')[0] as any;
      if (nav) {
        metrics.navigation = {
          type: nav.type,
          redirectCount: nav.redirectCount,
          transferSize: nav.transferSize
        };
        console.log(`[Stage 0] Navigation type: ${metrics.navigation.type}`);
      }
    }

    return Object.keys(metrics).length > 0 ? metrics : null;
  }

  /**
   * Detect browser capabilities for feature detection
   */
  private static detectBrowserCapabilities(): any {
    console.log('[Stage 0] Detecting browser capabilities...');

    const capabilities: any = {
      // Modern JavaScript features
      arrowFunctions: true,
      asyncAwait: typeof (async () => {}) === 'function',
      optionalChaining: ({} as any)?.test === undefined,
      nullishCoalescing: (null ?? 'default') === 'default',
      bigInt: typeof BigInt === 'function',
      modules: 'observable' in Symbol,

      // Web APIs
      webWorkers: typeof Worker !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      webSocket: typeof WebSocket !== 'undefined',
      fetch: typeof fetch === 'function',
      indexDB: typeof indexedDB !== 'undefined',
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      broadcastChannel: typeof BroadcastChannel !== 'undefined',
      requestIdleCallback: typeof requestIdleCallback !== 'undefined',
      intersectionObserver: typeof IntersectionObserver !== 'undefined',
      mutationObserver: typeof MutationObserver !== 'undefined',
      resizeObserver: typeof ResizeObserver !== 'undefined',
      performanceObserver: typeof PerformanceObserver !== 'undefined',

      // Graphics and media
      webGL: (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
          return false;
        }
      })(),
      webGL2: (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!canvas.getContext('webgl2');
        } catch {
          return false;
        }
      })(),

      // Input and interaction
      touch: 'ontouchstart' in window,
      pointerEvents: typeof PointerEvent !== 'undefined',
      gamepad: 'getGamepads' in navigator,
      vibration: 'vibrate' in navigator,

      // Security and privacy
      sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
      webAssembly: typeof WebAssembly !== 'undefined',
      secureContext: window.isSecureContext,

      // Storage
      storageManager: 'storage' in navigator,
      fileSystem: 'showOpenFilePicker' in window,
      clipboard: 'clipboard' in navigator,
      share: 'share' in navigator
    };

    console.log(`[Stage 0] WebGL: ${capabilities.webGL}, Workers: ${capabilities.webWorkers}`);
    return capabilities;
  }

  /**
   * Get viewport and display metrics
   */
  private static getViewportMetrics(): any {
    console.log('[Stage 0] Getting viewport metrics...');

    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      screenWidth: window.screen?.width,
      screenHeight: window.screen?.height,
      screenAvailWidth: window.screen?.availWidth,
      screenAvailHeight: window.screen?.availHeight,
      colorDepth: window.screen?.colorDepth,
      pixelDepth: window.screen?.pixelDepth,
      orientation: window.screen?.orientation?.type
    };
  }

  /**
   * Get network information if available
   */
  private static getNetworkInformation(): any {
    console.log('[Stage 0] Getting network information...');

    const connection = (navigator as any).connection;
    if (!connection) {
      return null;
    }

    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  /**
   * Get storage estimation for quota tracking
   */
  private static getStorageEstimation(): any {
    console.log('[Stage 0] Getting storage estimation...');

    if ('storage' in navigator && 'estimate' in (navigator as any).storage) {
      return (navigator as any).storage.estimate();
    }

    return null;
  }

  /**
   * Set up global flags
   */
  private static setupGlobalFlags(environmentData: EnvironmentData): void {
    console.log('[Stage 0] Setting up global flags...');

    // Set platform flag
    (window as any).__BOOTSTRAP_PLATFORM__ = environmentData.platform;
    console.log(`[Stage 0] ✓ __BOOTSTRAP_PLATFORM__ = ${environmentData.platform}`);

    // Set mode flag
    (window as any).__BOOTSTRAP_MODE__ = environmentData.mode;
    console.log(`[Stage 0] ✓ __BOOTSTRAP_MODE__ = ${environmentData.mode}`);

    // Set debug flag based on mode
    const debugMode = environmentData.mode === 'development';
    (window as any).__BOOTSTRAP_DEBUG__ = debugMode;
    console.log(`[Stage 0] ✓ __BOOTSTRAP_DEBUG__ = ${debugMode}`);

    console.log('[Stage 0] ✓ Global flags set');
  }

  /**
   * Get platform from globals
   */
  static getPlatform(): Platform {
    return (window as any).__BOOTSTRAP_PLATFORM__ || 'browser';
  }

  /**
   * Get mode from globals
   */
  static getMode(): Mode {
    return (window as any).__BOOTSTRAP_MODE__ || 'production';
  }

  /**
   * Check if debug mode is enabled
   */
  static isDebugMode(): boolean {
    return (window as any).__BOOTSTRAP_DEBUG__ || false;
  }
}
