/**
 * @module Bootstrap/Stages/Stage2-Configuration
 * @description
 * Stage 2: Configuration Loading
 * Fetches and validates workbench configuration from Mountain or meta tags.
 */

import type { StageResult, ConfigurationData, Platform } from '../Types/Types.js';
import { StatusReporter } from '../Core/StatusReporter.js';
import { ErrorHandler } from '../Core/ErrorHandler.js';

export class ConfigurationStage {
  static readonly STAGE_NAME = 'Configuration' as const;

  /**
   * Execute the configuration loading stage
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
        message: 'Loading configuration...',
        progress: 28.6
      });

      console.log('[Stage 2] Starting configuration loading...');

      // Get platform
      const platform = (window as any).__BOOTSTRAP_PLATFORM__ as Platform;
      console.log(`[Stage 2] Platform: ${platform}`);

      // Fetch configuration based on platform
      const config = await this.fetchConfiguration(platform);
      console.log('[Stage 2] ✓ Configuration fetched');

      // Validate configuration structure
      this.validateConfiguration(config);
      console.log('[Stage 2] ✓ Configuration validated');

      // Apply defaults for missing fields
      const normalizedConfig = this.normalizeConfiguration(config);
      console.log('[Stage 2] ✓ Configuration normalized');

      // Persist to window.vscode.context
      this.persistConfiguration(normalizedConfig);
      console.log('[Stage 2] ✓ Configuration persisted');

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: 'Configuration loaded and validated',
        progress: 42.9, // 3/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: normalizedConfig
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
          stage: 'Configuration Loading',
          suggestion: 'Check Mountain backend or meta tag configuration'
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
   * Fetch configuration from appropriate source
   */
  private static async fetchConfiguration(platform: Platform): Promise<any> {
    console.log(`[Stage 2] Fetching configuration from ${platform}...`);

    if (platform === 'tauri') {
      // Fetch from Mountain backend via Tauri
      return await this.fetchFromMountain();
    } else {
      // Fetch from meta tags (Browser mode)
      return await this.fetchFromMetaTags();
    }
  }

  /**
   * Fetch configuration from Mountain backend
   */
  private static async fetchFromMountain(): Promise<any> {
    console.log('[Stage 2] Fetching from Mountain backend...');

    try {
      // Check if Tauri invoke is available
      if (!('__TAURI__' in window) || !(window as any).__TAURI__.core) {
        throw new Error('Tauri invoke not available');
      }

      const { invoke } = (window as any).__TAURI__.core;
      
      const config = await invoke('mountain_get_workbench_configuration');
      
      if (!config || typeof config !== 'object') {
        throw new Error('Invalid configuration received from Mountain');
      }

      console.log('[Stage 2] ✓ Configuration received from Mountain');
      return config;

    } catch (error) {
      console.error('[Stage 2] ✗ Failed to fetch from Mountain:', error);
      throw error;
    }
  }

  /**
   * Fetch configuration from meta tags
   */
  private static async fetchFromMetaTags(): Promise<any> {
    console.log('[Stage 2] Fetching from meta tags...');

    const metaElement = document.getElementById('vscode-workbench-web-configuration');
    
    if (!metaElement) {
      throw new Error('Configuration meta tag not found');
    }

    const settings = metaElement.getAttribute('data-settings');
    
    if (!settings) {
      throw new Error('Configuration data-settings attribute not found');
    }

    try {
      const config = JSON.parse(settings);
      console.log('[Stage 2] ✓ Configuration parsed from meta tags');
      return config;
    } catch (error) {
      console.error('[Stage 2] ✗ Failed to parse configuration:', error);
      throw new Error('Failed to parse configuration from meta tags');
    }
  }

  /**
   * Validate configuration structure
   */
  private static validateConfiguration(config: any): void {
    console.log('[Stage 2] Validating configuration structure...');

    const requiredFields = [
      'windowId',
      'machineId',
      'sessionId',
      'appRoot',
      'platform',
      'arch',
      'logLevel'
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!config[field]) {
        missingFields.push(field);
        console.warn(`[Stage 2] ⚠ Missing required field: ${field}`);
      } else {
        console.log(`[Stage 2] ✓ Field present: ${field}`);
      }
    }

    if (missingFields.length > 0) {
      throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
    }

    // Validate platform
    const validPlatforms = ['win32', 'darwin', 'linux', 'web'];
    if (!validPlatforms.includes(config.platform)) {
      throw new Error(`Invalid platform: ${config.platform}`);
    }

    // Validate arch
    const validArchs = ['x64', 'arm64', 'ia32', 'web'];
    if (!validArchs.includes(config.arch)) {
      throw new Error(`Invalid arch: ${config.arch}`);
    }

    // Validate log level
    if (typeof config.logLevel !== 'number' || config.logLevel < 0 || config.logLevel > 5) {
      throw new Error(`Invalid log level: ${config.logLevel}`);
    }

    console.log('[Stage 2] ✓ Configuration structure validated');
  }

  /**
   * Normalize configuration with defaults
   */
  private static normalizeConfiguration(config: any): ConfigurationData {
    console.log('[Stage 2] Normalizing configuration...');

    const normalized: ConfigurationData = {
      windowId: config.windowId || '1',
      machineId: config.machineId || this.generateMachineId(),
      sessionId: config.sessionId || this.generateSessionId(),
      appRoot: config.appRoot || 'file:///app',
      userDataPath: config.userDataPath || 'file:///app/user-data',
      platform: config.platform || 'web',
      arch: config.arch || 'web',
      logLevel: config.logLevel || 2,
      ...config
    };

    // Ensure product configuration exists
    if (!normalized.productConfiguration) {
      normalized.productConfiguration = {
        nameShort: 'VSCode',
        nameLong: 'VSCode Wind',
        applicationName: 'vscode-wind',
        embedderIdentifier: 'wind-desktop'
      };
    }

    // Ensure NLS configuration exists
    if (!normalized.nls) {
      normalized.nls = {
        language: 'en',
        availableLanguages: { en: 'English' },
        messages: {}
      };
    }

    console.log('[Stage 2] ✓ Configuration normalized');
    return normalized;
  }

  /**
   * Persist configuration to window.vscode.context
   */
  private static persistConfiguration(config: ConfigurationData): void {
    console.log('[Stage 2] Persisting configuration to window.vscode.context...');

    const vscode = (window as any).vscode;
    
    if (!vscode || !vscode.context) {
      throw new Error('window.vscode.context not available');
    }

    // Store configuration
    vscode.context._configuration = config;
    
    // Update configuration getter
    vscode.context.configuration = () => config;

    console.log('[Stage 2] ✓ Configuration persisted');
  }

  /**
   * Generate a machine ID
   */
  private static generateMachineId(): string {
    // Check if already persisted
    const existing = localStorage.getItem('vscode-wind-machine-id');
    if (existing) {
      console.log('[Stage 2] Using existing machine ID');
      return existing;
    }

    // Generate new ID
    const newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    // Persist
    localStorage.setItem('vscode-wind-machine-id', newId);
    console.log('[Stage 2] Generated and persisted new machine ID');
    return newId;
  }

  /**
   * Generate a session ID
   */
  private static generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get configuration from window.vscode.context
   */
  static getConfiguration(): ConfigurationData | null {
    const vscode = (window as any).vscode;
    return vscode?.context?._configuration || null;
  }
}
