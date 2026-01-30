/**
 * @module Bootstrap/Stages/Stage4-Preparation
 * @description
 * Stage 4: Workbench Preparation
 * Prepares the DOM and environment for VSCode workbench initialization.
 */

import type { StageResult } from '../Types/Types.js';
import { StatusReporter } from '../Core/StatusReporter.js';
import { ErrorHandler } from '../Core/ErrorHandler.js';

export class PreparationStage {
  static readonly STAGE_NAME = 'Preparation' as const;

  /**
   * Execute the workbench preparation stage
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
        message: 'Preparing workbench environment...',
        progress: 57.1
      });

      console.log('[Stage 4] Starting workbench preparation...');

      // Wait for DOM ready
      await this.waitForDOMReady();
      console.log('[Stage 4] ✓ DOM ready');

      // Validate DOM structure
      this.validateDOMStructure();
      console.log('[Stage 4] ✓ DOM structure validated');

      // Set up global variables for VSCode
      this.setupGlobalVariables();
      console.log('[Stage 4] ✓ Global variables set');

      // Load worker scripts
      await this.loadWorkerScripts();
      console.log('[Stage 4] ✓ Worker scripts loaded');

      // Prepare VSCode configuration
      await this.prepareVSCodeConfiguration();
      console.log('[Stage 4] ✓ VSCode configuration prepared');

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: 'Workbench environment prepared',
        progress: 71.4, // 5/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: {
          domReady: true,
          workersLoaded: true,
          configurationReady: true
        }
      };

    } catch (error) {
      const duration = performance.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Handle error
      await errorHandler.handle(
        this.STAGE_NAME,
        errorObj,
        'warning', // Preparation failures can often be recovered
        { 
          stage: 'Workbench Preparation',
          suggestion: 'Some preparation steps failed, but workbench may still start'
        }
      );

      return {
        success: true, // Continue even if preparation fails
        stage: this.STAGE_NAME,
        duration,
        data: {
          domReady: false,
          workersLoaded: false,
          configurationReady: false
        },
        warnings: [errorObj.message]
      };
    }
  }

  /**
   * Wait for DOM to be ready
   */
  private static async waitForDOMReady(): Promise<void> {
    console.log('[Stage 4] Waiting for DOM ready...');

    if (document.readyState === 'loading') {
      await new Promise<void>((resolve) => {
        document.addEventListener('DOMContentLoaded', () => resolve());
      });
    }

    console.log('[Stage 4] ✓ DOM ready');
  }

  /**
   * Validate DOM structure
   */
  private static validateDOMStructure(): void {
    console.log('[Stage 4] Validating DOM structure...');

    // Check for required DOM elements
    const requiredElements = [
      'body',
      'head',
      'title'
    ];

    const missingElements: string[] = [];

    for (const element of requiredElements) {
      if (!document[element]) {
        missingElements.push(element);
        console.warn(`[Stage 4] ⚠ Missing DOM element: ${element}`);
      }
    }

    if (missingElements.length > 0) {
      throw new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
    }

    // Check for VSCode workbench container
    const workbenchContainer = document.getElementById('vscode-workbench');
    if (!workbenchContainer) {
      console.warn('[Stage 4] ⚠ VSCode workbench container not found');
      
      // Create workbench container if missing
      this.createWorkbenchContainer();
    }

    console.log('[Stage 4] ✓ DOM structure validated');
  }

  /**
   * Create workbench container if missing
   */
  private static createWorkbenchContainer(): void {
    console.log('[Stage 4] Creating workbench container...');

    const container = document.createElement('div');
    container.id = 'vscode-workbench';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    `;

    document.body.appendChild(container);
    console.log('[Stage 4] ✓ Workbench container created');
  }

  /**
   * Set up global variables for VSCode
   */
  private static setupGlobalVariables(): void {
    console.log('[Stage 4] Setting up global variables...');

    // Set VSCode file root
    (window as any)._VSCODE_FILE_ROOT = (window as any).vscode?.context?._configuration?.appRoot || 'file:///app';
    console.log(`[Stage 4] ✓ _VSCODE_FILE_ROOT = ${(window as any)._VSCODE_FILE_ROOT}`);

    // Set global configuration
    (window as any)._WORKBENCH_CONFIGURATION = (window as any).vscode?.context?._configuration || {};
    console.log('[Stage 4] ✓ _WORKBENCH_CONFIGURATION set');

    // Set global services
    (window as any)._WORKBENCH_SERVICES = (window as any).__SERVICE_COLLECTION__ || {};
    console.log('[Stage 4] ✓ _WORKBENCH_SERVICES set');

    console.log('[Stage 4] ✓ Global variables set');
  }

  /**
   * Load worker scripts
   */
  private static async loadWorkerScripts(): Promise<void> {
    console.log('[Stage 4] Loading worker scripts...');

    try {
      // Load VSCode workbench worker
      await this.loadScript('/vs/workbench/workbench.web.main.js');
      console.log('[Stage 4] ✓ Workbench worker loaded');

      // Load additional workers if available
      await this.loadScript('/vs/base/worker/workerMain.js');
      console.log('[Stage 4] ✓ Base worker loaded');

    } catch (error) {
      console.warn('[Stage 4] ⚠ Failed to load worker scripts:', error);
      
      // Worker scripts are not critical - continue
      console.log('[Stage 4] ✓ Continuing without worker scripts');
    }
  }

  /**
   * Load a script dynamically
   */
  private static async loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'module';
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Prepare VSCode configuration
   */
  private static async prepareVSCodeConfiguration(): Promise<void> {
    console.log('[Stage 4] Preparing VSCode configuration...');

    const config = (window as any).vscode?.context?._configuration;
    
    if (!config) {
      throw new Error('VSCode configuration not available');
    }

    // Create configuration meta tag for VSCode
    this.createConfigurationMetaTag(config);
    console.log('[Stage 4] ✓ Configuration meta tag created');

    // Set up NLS (National Language Support)
    this.setupNLS(config);
    console.log('[Stage 4] ✓ NLS setup');

    console.log('[Stage 4] ✓ VSCode configuration prepared');
  }

  /**
   * Create configuration meta tag for VSCode
   */
  private static createConfigurationMetaTag(config: any): void {
    console.log('[Stage 4] Creating configuration meta tag...');

    // Remove existing meta tag if present
    const existingMeta = document.getElementById('vscode-workbench-web-configuration');
    if (existingMeta) {
      existingMeta.remove();
    }

    // Create new meta tag
    const metaTag = document.createElement('meta');
    metaTag.id = 'vscode-workbench-web-configuration';
    metaTag.setAttribute('data-settings', JSON.stringify(config));
    
    document.head.appendChild(metaTag);
    console.log('[Stage 4] ✓ Configuration meta tag created');
  }

  /**
   * Set up NLS (National Language Support)
   */
  private static setupNLS(config: any): void {
    console.log('[Stage 4] Setting up NLS...');

    const nlsConfig = config.nls || {
      language: 'en',
      availableLanguages: { en: 'English' },
      messages: {}
    };

    // Set global NLS configuration
    (window as any)._VSCODE_NLS_CONFIG = {
      locale: nlsConfig.language,
      availableLanguages: nlsConfig.availableLanguages,
      _languagePackSupport: true
    };

    console.log(`[Stage 4] ✓ NLS configured for locale: ${nlsConfig.language}`);
  }

  /**
   * Get preparation status
   */
  static getPreparationStatus(): {
    domReady: boolean;
    workersLoaded: boolean;
    configurationReady: boolean;
    vscodeGlobalsSet: boolean;
  } {
    return {
      domReady: document.readyState !== 'loading',
      workersLoaded: !!(window as any)._VSCODE_WORKBENCH_WORKER,
      configurationReady: !!(window as any)._WORKBENCH_CONFIGURATION,
      vscodeGlobalsSet: !!(window as any)._VSCODE_FILE_ROOT
    };
  }
}
