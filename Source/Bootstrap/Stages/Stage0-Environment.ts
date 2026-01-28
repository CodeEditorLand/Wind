/**
 * @module Bootstrap/Stages/Stage0-Environment
 * @description
 * Stage 0: Environment Detection
 * Detects platform, mode, and validates runtime environment.
 */

import type { StageResult, EnvironmentData, Platform, Mode } from '../Types/Types.js';
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
   * Gather environment data
   */
  private static gatherEnvironmentData(platform: Platform, mode: Mode): EnvironmentData {
    console.log('[Stage 0] Gathering environment data...');

    const environmentData: EnvironmentData = {
      platform,
      mode,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    // Add performance data if available
    if ('memory' in performance) {
      (environmentData as any).memory = (performance as any).memory;
    }

    // Add timing data if available
    if ('timing' in performance) {
      (environmentData as any).timing = performance.timing;
    }

    console.log('[Stage 0] ✓ Environment data gathered');
    return environmentData;
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
