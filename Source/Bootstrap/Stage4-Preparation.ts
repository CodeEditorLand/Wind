/**
 * @module Stage4-Preparation
 * @description
 * Stage 4: Workbench Preparation
 * Waits for DOM ready, validates DOM structure, sets up global variables,
 * and loads worker scripts.
 */

import type { StageResult } from './Types.js';
import { StatusReporter } from './StatusReporter.js';
import { ErrorHandler } from './ErrorHandler.js';

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
        message: 'Preparing workbench...',
        progress: 57.1
      });

      console.log('[Stage 4] Starting workbench preparation...');

      // Wait for DOM ready
      await this.waitForDOMReady();
      console.log('[Stage 4] ✓ DOM ready');

      // Validate DOM structure
      this.validateDOMStructure();
      console.log('[Stage 4] ✓ DOM structure validated');

      // Set up global variables
      this.setupGlobalVariables();
      console.log('[Stage 4] ✓ Global variables set');

      // Load worker scripts
      await this.loadWorkerScripts();
      console.log('[Stage 4] ✓ Worker scripts loaded');

      // Load NLS messages
      await this.loadNLSMessages();
      console.log('[Stage 4] ✓ NLS messages loaded');

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: 'Workbench prepared',
        progress: 71.4, // 5/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: {
          domReady: true,
          globalVariablesSet: true,
          workersLoaded: true,
          nlsLoaded: true
        }
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
          stage: 'Workbench Preparation',
          suggestion: 'Ensure DOM is ready and scripts are loaded'
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
   * Wait for DOM to be ready
   */
  private static async waitForDOMReady(): Promise<void> {
    console.log('[Stage 4] Waiting for DOM ready...');

    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        console.log('[Stage 4] DOM still loading, waiting for DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', () => {
          console.log('[Stage 4] ✓ DOMContentLoaded event fired');
          resolve();
        }, { once: true });
      } else {
        console.log('[Stage 4] ✓ DOM already ready');
        resolve();
      }
    });
  }

  /**
   * Validate DOM structure
   */
  private static validateDOMStructure(): void {
    console.log('[Stage 4] Validating DOM structure...');

    // Check for body element
    if (!document.body) {
      throw new Error('document.body not available');
    }
    console.log('[Stage 4] ✓ document.body available');

    // Check for head element
    if (!document.head) {
      throw new Error('document.head not available');
    }
    console.log('[Stage 4] ✓ document.head available');

    // Check for required meta tags
    const requiredMetaTags = [
      'vscode-workbench-web-configuration',
      'vscode-workbench-auth-session'
    ];

    for (const tagId of requiredMetaTags) {
      const tag = document.getElementById(tagId);
      if (!tag) {
        console.warn(`[Stage 4] ⚠ Required meta tag not found: ${tagId}`);
      } else {
        console.log(`[Stage 4] ✓ Meta tag found: ${tagId}`);
      }
    }

    console.log('[Stage 4] ✓ DOM structure validated');
  }

  /**
   * Set up global variables
   */
  private static setupGlobalVariables(): void {
    console.log('[Stage 4] Setting up global variables...');

    // Set _VSCODE_FILE_ROOT if not already set
    if (!(window as any)._VSCODE_FILE_ROOT) {
      const fileRoot = `${window.location.origin}/Static/Application/`;
      (window as any)._VSCODE_FILE_ROOT = fileRoot;
      console.log(`[Stage 4] ✓ _VSCODE_FILE_ROOT set to: ${fileRoot}`);
    } else {
      console.log('[Stage 4] ✓ _VSCODE_FILE_ROOT already set');
    }

    // Set _WORKER if not already set
    if (!(window as any)._WORKER) {
      const worker = `/Worker.js?BASE_REMOTE=${encodeURIComponent(window.location.origin)}`;
      (window as any)._WORKER = worker;
      console.log(`[Stage 4] ✓ _WORKER set to: ${worker}`);
    } else {
      console.log('[Stage 4] ✓ _WORKER already set');
    }

    // Set bootstrap globals
    (window as any).__BOOTSTRAP_DOM_READY__ = true;
    console.log('[Stage 4] ✓ __BOOTSTRAP_DOM_READY__ set');

    console.log('[Stage 4] ✓ Global variables set');
  }

  /**
   * Load worker scripts
   */
  private static async loadWorkerScripts(): Promise<void> {
    console.log('[Stage 4] Loading worker scripts...');

    const workerScripts = [
      '/Worker/CSS/Load.js',
      '/Worker/Policy.js',
      '/Worker/Register.js'
    ];

    const loadPromises = workerScripts.map(script => {
      return new Promise<void>((resolve, reject) => {
        console.log(`[Stage 4] Loading worker script: ${script}`);
        
        const scriptElement = document.createElement('script');
        scriptElement.type = 'module';
        scriptElement.src = script;
        
        scriptElement.onload = () => {
          console.log(`[Stage 4] ✓ Worker script loaded: ${script}`);
          resolve();
        };
        
        scriptElement.onerror = (error) => {
          console.error(`[Stage 4] ✗ Failed to load worker script: ${script}`, error);
          // Don't reject - worker scripts are not critical
          resolve();
        };
        
        document.head.appendChild(scriptElement);
      });
    });

    await Promise.all(loadPromises);
    console.log('[Stage 4] ✓ Worker scripts loaded');
  }

  /**
   * Load NLS messages
   */
  private static async loadNLSMessages(): Promise<void> {
    console.log('[Stage 4] Loading NLS messages...');

    const isDevelopment = (window as any).__BOOTSTRAP_MODE__ === 'development';
    const nlsPath = `/Static/Application/${isDevelopment ? 'vs/' : ''}nls.messages.js`;

    return new Promise<void>((resolve) => {
      console.log(`[Stage 4] Loading NLS from: ${nlsPath}`);
      
      const scriptElement = document.createElement('script');
      scriptElement.type = 'module';
      scriptElement.src = nlsPath;
      
      scriptElement.onload = () => {
        console.log('[Stage 4] ✓ NLS messages loaded');
        resolve();
      };
      
      scriptElement.onerror = (error) => {
        console.warn('[Stage 4] ⚠ Failed to load NLS messages:', error);
        // NLS is not critical
        resolve();
      };
      
      document.head.appendChild(scriptElement);
    });
  }
}