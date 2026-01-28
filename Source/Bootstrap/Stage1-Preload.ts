/**
 * @module Stage1-Preload
 * @description
 * Stage 1: Preload Initialization
 * Validates that the Wind preload script has loaded and window.vscode is available.
 */

import type { StageResult } from './Types.js';
import { StatusReporter } from './StatusReporter.js';
import { ErrorHandler } from './ErrorHandler.js';

export class PreloadStage {
  static readonly STAGE_NAME = 'Preload' as const;
  private static readonly PRELOAD_TIMEOUT = 5000; // 5 seconds

  /**
   * Execute the preload validation stage
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
        message: 'Validating preload script...',
        progress: 14.3
      });

      console.log('[Stage 1] Starting preload validation...');

      // Check if window.vscode exists
      const vscode = await this.waitForPreload();
      console.log('[Stage 1] ✓ window.vscode available');

      // Validate API shims
      this.validateAPIShims(vscode);
      console.log('[Stage 1] ✓ API shims validated');

      // Test IPC communication
      await this.testIPCCommunication(vscode);
      console.log('[Stage 1] ✓ IPC communication tested');

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: 'Preload script validated',
        progress: 28.6, // 2/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: {
          hasIpcRenderer: !!vscode.ipcRenderer,
          hasProcess: !!vscode.process,
          hasContext: !!vscode.context,
          hasWebFrame: !!vscode.webFrame,
          processPlatform: vscode.process?.platform,
          processArch: vscode.process?.arch
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
          stage: 'Preload Validation',
          suggestion: 'Ensure Wind preload script is loaded before bootstrap'
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
   * Wait for window.vscode to be available
   */
  private static async waitForPreload(): Promise<any> {
    console.log('[Stage 1] Waiting for window.vscode...');

    // Check if already available
    if ((window as any).vscode) {
      console.log('[Stage 1] ✓ window.vscode already available');
      return (window as any).vscode;
    }

    // Wait for preload-ready event
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Preload script not ready after timeout'));
      }, this.PRELOAD_TIMEOUT);

      const onPreloadReady = () => {
        clearTimeout(timeout);
        console.log('[Stage 1] ✓ preload-ready event received');
        resolve((window as any).vscode);
      };

      window.addEventListener('vscode-wind-preload-ready', onPreloadReady, { once: true });

      // Check again in case event already fired
      if ((window as any).vscode) {
        clearTimeout(timeout);
        window.removeEventListener('vscode-wind-preload-ready', onPreloadReady);
        resolve((window as any).vscode);
      }
    });
  }

  /**
   * Validate that all required API shims are present
   */
  private static validateAPIShims(vscode: any): void {
    console.log('[Stage 1] Validating API shims...');

    const requiredAPIs = [
      'ipcRenderer',
      'process',
      'context',
      'webFrame',
      'webUtils',
      'ipcMessagePort'
    ];

    const missingAPIs: string[] = [];

    for (const api of requiredAPIs) {
      if (!vscode[api]) {
        missingAPIs.push(api);
        console.warn(`[Stage 1] ⚠ Missing API: ${api}`);
      } else {
        console.log(`[Stage 1] ✓ API present: ${api}`);
      }
    }

    if (missingAPIs.length > 0) {
      throw new Error(`Missing required API shims: ${missingAPIs.join(', ')}`);
    }

    // Validate context has configuration
    if (!vscode.context || !vscode.context.configuration) {
      throw new Error('vscode.context.configuration is not available');
    }

    console.log('[Stage 1] ✓ All required API shims present');
  }

  /**
   * Test IPC communication
   */
  private static async testIPCCommunication(vscode: any): Promise<void> {
    console.log('[Stage 1] Testing IPC communication...');

    try {
      // Test that ipcRenderer methods exist
      const ipcMethods = ['send', 'invoke', 'on', 'once', 'removeListener', 'emit'];
      
      for (const method of ipcMethods) {
        if (typeof vscode.ipcRenderer[method] !== 'function') {
          throw new Error(`ipcRenderer.${method} is not a function`);
        }
        console.log(`[Stage 1] ✓ ipcRenderer.${method} available`);
      }

      // Test process properties
      const processProps = ['platform', 'arch', 'env', 'cwd'];
      
      for (const prop of processProps) {
        if (!vscode.process[prop]) {
          console.warn(`[Stage 1] ⚠ process.${prop} not available`);
        } else {
          console.log(`[Stage 1] ✓ process.${prop} available`);
        }
      }

      console.log('[Stage 1] ✓ IPC communication validated');

    } catch (error) {
      console.error('[Stage 1] ✗ IPC communication test failed:', error);
      throw error;
    }
  }
}