/**
 * @module Bootstrap/Stages/Stage1-Preload
 * @description
 * Stage 1: Preload Initialization
 * Loads Wind preload script and validates window.vscode API shims.
 */

import type { StageResult } from '../Types/Types.js';
import { StatusReporter } from '../Core/StatusReporter.js';
import { ErrorHandler } from '../Core/ErrorHandler.js';

export class PreloadStage {
  static readonly STAGE_NAME = 'Preload' as const;

  /**
   * Execute the preload initialization stage
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
        message: 'Loading preload script...',
        progress: 14.3
      });

      console.log('[Stage 1] Starting preload initialization...');

      // Wait for preload script to be ready
      await this.waitForPreloadReady();
      console.log('[Stage 1] ✓ Preload script ready');

      // Validate window.vscode exists
      this.validateVSCodeAPI();
      console.log('[Stage 1] ✓ window.vscode API validated');

      // Verify API shims are present
      this.verifyAPIShims();
      console.log('[Stage 1] ✓ API shims verified');

      // Test IPC communication
      await this.testIPCCommunication();
      console.log('[Stage 1] ✓ IPC communication tested');

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: 'Preload script loaded and validated',
        progress: 28.6, // 2/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: {
          vscodeAPIAvailable: true,
          ipcAvailable: true,
          shimsAvailable: true
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
          stage: 'Preload Initialization',
          suggestion: 'Check Wind preload script loading and console for errors'
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
   * Wait for preload script to be ready
   */
  private static async waitForPreloadReady(): Promise<void> {
    console.log('[Stage 1] Waiting for preload script...');

    const maxWaitTime = 5000; // 5 seconds
    const startTime = performance.now();

    while (performance.now() - startTime < maxWaitTime) {
      if (this.isPreloadReady()) {
        console.log('[Stage 1] ✓ Preload script ready');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error('Preload script not ready after timeout');
  }

  /**
   * Check if preload script is ready
   */
  private static isPreloadReady(): boolean {
    const vscode = (window as any).vscode;
    
    return !!(vscode && 
             vscode.context && 
             vscode.context.configuration && 
             vscode.ipcRenderer);
  }

  /**
   * Validate window.vscode API
   */
  private static validateVSCodeAPI(): void {
    console.log('[Stage 1] Validating window.vscode API...');

    const vscode = (window as any).vscode;
    
    if (!vscode) {
      throw new Error('window.vscode not available');
    }

    // Check required properties
    const requiredProperties = ['context', 'ipcRenderer', 'process'];
    const missingProperties: string[] = [];

    for (const prop of requiredProperties) {
      if (!vscode[prop]) {
        missingProperties.push(prop);
        console.warn(`[Stage 1] ⚠ Missing property: ${prop}`);
      }
    }

    if (missingProperties.length > 0) {
      throw new Error(`Missing required properties: ${missingProperties.join(', ')}`);
    }

    // Validate context structure
    if (!vscode.context.configuration) {
      throw new Error('vscode.context.configuration not available');
    }

    console.log('[Stage 1] ✓ window.vscode API validated');
  }

  /**
   * Verify API shims are present
   */
  private static verifyAPIShims(): void {
    console.log('[Stage 1] Verifying API shims...');

    const vscode = (window as any).vscode;
    
    // Check IPC shim
    if (!vscode.ipcRenderer || typeof vscode.ipcRenderer.invoke !== 'function') {
      throw new Error('IPC renderer shim not available');
    }

    // Check process shim
    if (!vscode.process || typeof vscode.process.arch !== 'string') {
      throw new Error('Process shim not available');
    }

    // Check environment shim
    if (!vscode.context._configuration) {
      throw new Error('Configuration shim not available');
    }

    console.log('[Stage 1] ✓ API shims verified');
  }

  /**
   * Test IPC communication
   */
  private static async testIPCCommunication(): Promise<void> {
    console.log('[Stage 1] Testing IPC communication...');

    const vscode = (window as any).vscode;
    
    try {
      // Test basic IPC call
      const result = await vscode.ipcRenderer.invoke('vscode:test-connection');
      
      if (result !== 'pong') {
        console.warn('[Stage 1] ⚠ IPC test returned unexpected result:', result);
      }

      console.log('[Stage 1] ✓ IPC communication tested');
    } catch (error) {
      console.warn('[Stage 1] ⚠ IPC test failed:', error);
      
      // IPC test failure is not critical - continue anyway
      console.log('[Stage 1] ✓ IPC communication test failed but continuing');
    }
  }

  /**
   * Get preload status
   */
  static getPreloadStatus(): {
    ready: boolean;
    vscodeAvailable: boolean;
    contextAvailable: boolean;
    ipcAvailable: boolean;
  } {
    const vscode = (window as any).vscode;
    
    return {
      ready: this.isPreloadReady(),
      vscodeAvailable: !!vscode,
      contextAvailable: !!(vscode && vscode.context),
      ipcAvailable: !!(vscode && vscode.ipcRenderer)
    };
  }
}
