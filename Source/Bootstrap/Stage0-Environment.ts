/**
 * @module Stage0-Environment
 * @description
 * Stage 0: Environment Detection
 * Detects the runtime environment (Tauri/Browser), mode (Development/Production),
 * and validates the runtime environment.
 */

import type { StageResult, Platform, Mode, EnvironmentData } from './Types.js';
import { StatusReporter } from './StatusReporter.js';
import { ErrorHandler } from './ErrorHandler.js';

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
      console.log(`[Stage 0] Platform detected: ${platform}`);

      // Detect mode
      const mode = this.detectMode();
      console.log(`[Stage 0] Mode detected: ${mode}`);

      // Validate runtime
      await this.validateRuntime(platform);
      console.log('[Stage 0] Runtime validated');

      // Collect environment data
      const envData: EnvironmentData = {
        platform,
        mode,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // Set global flags
      this.setGlobalFlags(platform, mode);
      console.log('[Stage 0] Global flags set');

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: `Environment detected: ${platform} (${mode})`,
        progress: 14.3, // 1/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: envData
      };

    } catch (error) {
      const duration = performance.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Handle error
      await errorHandler.handle(
        this.STAGE_NAME,
        errorObj,
        'critical',
        { stage: 'Environment Detection' }
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
   * Detect the platform (Tauri or Browser)
   */
  private static detectPlatform(): Platform {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      console.log('[Stage 0] Tauri environment detected');
      return 'tauri';
    }
    console.log('[Stage 0] Browser environment detected');
    return 'browser';
  }

  /**
   * Detect the mode (Development or Production)
   */
  private static detectMode(): Mode {
    // Check for development indicators
    const isDevelopment = 
      process.env['NODE_ENV'] === 'development' ||
      process.env['TAURI_ENV_DEBUG'] === 'true' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    const mode = isDevelopment ? 'development' : 'production';
    console.log(`[Stage 0] Mode: ${mode} (NODE_ENV=${process.env['NODE_ENV']})`);
    return mode;
  }

  /**
   * Validate the runtime environment
   */
  private static async validateRuntime(platform: Platform): Promise<void> {
    console.log('[Stage 0] Validating runtime...');

    // Check for required browser APIs
    const requiredAPIs = [
      'Promise',
      'fetch',
      'console',
      'localStorage',
      'sessionStorage'
    ];

    for (const api of requiredAPIs) {
      if (!(api in window)) {
        throw new Error(`Required browser API not available: ${api}`);
      }
    }

    // Check for Tauri APIs if in Tauri mode
    if (platform === 'tauri') {
      if (!('__TAURI__' in window)) {
        throw new Error('Tauri APIs not available in Tauri mode');
      }
      console.log('[Stage 0] ✓ Tauri APIs available');
    }

    // Check for required VSCode globals
    if ('_VSCODE_FILE_ROOT' in window) {
      console.log('[Stage 0] ✓ _VSCODE_FILE_ROOT already set');
    } else {
      console.log('[Stage 0] ℹ _VSCODE_FILE_ROOT not yet set (will be set in Stage 4)');
    }

    // Check for worker support
    if (typeof Worker === 'undefined') {
      console.warn('[Stage 0] ⚠ Web Workers not supported');
    } else {
      console.log('[Stage 0] ✓ Web Workers supported');
    }

    console.log('[Stage 0] ✓ Runtime validation complete');
  }

  /**
   * Set global flags for the bootstrap process
   */
  private static setGlobalFlags(platform: Platform, mode: Mode): void {
    // Set platform flag
    (window as any).__BOOTSTRAP_PLATFORM__ = platform;
    console.log(`[Stage 0] Set __BOOTSTRAP_PLATFORM__ = ${platform}`);

    // Set mode flag
    (window as any).__BOOTSTRAP_MODE__ = mode;
    console.log(`[Stage 0] Set __BOOTSTRAP_MODE__ = ${mode}`);

    // Set debug flag
    const isDebug = mode === 'development';
    (window as any).__BOOTSTRAP_DEBUG__ = isDebug;
    console.log(`[Stage 0] Set __BOOTSTRAP_DEBUG__ = ${isDebug}`);

    // Set timestamp
    (window as any).__BOOTSTRAP_START_TIME__ = Date.now();
    console.log(`[Stage 0] Set __BOOTSTRAP_START_TIME__ = ${Date.now()}`);
  }

  /**
   * Get environment data from window globals
   */
  static getEnvironmentData(): EnvironmentData | null {
    const platform = (window as any).__BOOTSTRAP_PLATFORM__;
    const mode = (window as any).__BOOTSTRAP_MODE__;

    if (!platform || !mode) {
      return null;
    }

    return {
      platform,
      mode,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}