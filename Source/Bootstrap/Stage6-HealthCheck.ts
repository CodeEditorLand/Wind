/**
 * @module Stage6-HealthCheck
 * @description
 * Stage 6: Health Check
 * Verifies that the workbench is running and core functionality works.
 */

import type { StageResult } from './Types.js';
import { StatusReporter } from './StatusReporter.js';
import { ErrorHandler } from './ErrorHandler.js';

export class HealthCheckStage {
  static readonly STAGE_NAME = 'HealthCheck' as const;

  /**
   * Execute the health check stage
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
        message: 'Performing health check...',
        progress: 85.7
      });

      console.log('[Stage 6] Starting health check...');

      // Verify workbench is running
      const workbenchRunning = await this.verifyWorkbenchRunning();
      console.log(`[Stage 6] ✓ Workbench running: ${workbenchRunning}`);

      // Test core functionality
      const coreFunctionality = await this.testCoreFunctionality();
      console.log(`[Stage 6] ✓ Core functionality: ${coreFunctionality}`);

      // Check for errors
      const hasErrors = this.checkForErrors();
      console.log(`[Stage 6] ✓ Error check: ${hasErrors ? 'Errors found' : 'No errors'}`);

      // Collect health metrics
      const healthMetrics = this.collectHealthMetrics();
      console.log('[Stage 6] ✓ Health metrics collected');

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: 'Health check complete',
        progress: 100, // 7/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: {
          workbenchRunning,
          coreFunctionality,
          hasErrors,
          healthMetrics
        }
      };

    } catch (error) {
      const duration = performance.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Handle error
      await errorHandler.handle(
        this.STAGE_NAME,
        errorObj,
        'warning', // Health check failures are not critical
        { 
          stage: 'Health Check',
          suggestion: 'Workbench may still function despite health check failures'
        }
      );

      return {
        success: true, // Continue even if health check fails
        stage: this.STAGE_NAME,
        duration,
        data: {
          workbenchRunning: false,
          coreFunctionality: false,
          hasErrors: true,
          healthMetrics: {}
        },
        warnings: [errorObj.message]
      };
    }
  }

  /**
   * Verify workbench is running
   */
  private static async verifyWorkbenchRunning(): Promise<boolean> {
    console.log('[Stage 6] Verifying workbench is running...');

    try {
      // Check if workbench instance exists
      const workbench = (window as any).__WORKBENCH_INSTANCE__;
      if (!workbench) {
        console.log('[Stage 6] ℹ Workbench instance not found');
        return false;
      }

      // Check if workbench is started
      if (typeof workbench.isStarted === 'function') {
        const isStarted = workbench.isStarted();
        console.log(`[Stage 6] Workbench.isStarted(): ${isStarted}`);
        return isStarted;
      }

      // Check if workbench has required methods
      const requiredMethods = ['startup', 'shutdown', 'dispose'];
      const hasMethods = requiredMethods.every(method => typeof workbench[method] === 'function');
      console.log(`[Stage 6] Workbench has required methods: ${hasMethods}`);
      return hasMethods;

    } catch (error) {
      console.error('[Stage 6] ✗ Failed to verify workbench:', error);
      return false;
    }
  }

  /**
   * Test core functionality
   */
  private static async testCoreFunctionality(): Promise<boolean> {
    console.log('[Stage 6] Testing core functionality...');

    const tests = [
      this.testWindowVscode,
      this.testConfiguration,
      this.testIPC,
      this.testServices
    ];

    const results = await Promise.all(tests.map(test => test()));
    const allPassed = results.every(result => result);

    console.log(`[Stage 6] Core functionality tests: ${results.filter(r => r).length}/${results.length} passed`);
    return allPassed;
  }

  /**
   * Test window.vscode
   */
  private static async testWindowVscode(): Promise<boolean> {
    console.log('[Stage 6] Testing window.vscode...');

    try {
      const vscode = (window as any).vscode;
      if (!vscode) {
        console.warn('[Stage 6] ⚠ window.vscode not available');
        return false;
      }

      const requiredAPIs = ['ipcRenderer', 'process', 'context'];
      const hasAPIs = requiredAPIs.every(api => !!vscode[api]);
      
      console.log(`[Stage 6] window.vscode has required APIs: ${hasAPIs}`);
      return hasAPIs;

    } catch (error) {
      console.error('[Stage 6] ✗ Failed to test window.vscode:', error);
      return false;
    }
  }

  /**
   * Test configuration
   */
  private static async testConfiguration(): Promise<boolean> {
    console.log('[Stage 6] Testing configuration...');

    try {
      const vscode = (window as any).vscode;
      if (!vscode || !vscode.context || !vscode.context.configuration) {
        console.warn('[Stage 6] ⚠ Configuration not available');
        return false;
      }

      const config = vscode.context.configuration();
      if (!config) {
        console.warn('[Stage 6] ⚠ Configuration is null');
        return false;
      }

      const requiredFields = ['windowId', 'machineId', 'sessionId', 'appRoot'];
      const hasFields = requiredFields.every(field => !!config[field]);
      
      console.log(`[Stage 6] Configuration has required fields: ${hasFields}`);
      return hasFields;

    } catch (error) {
      console.error('[Stage 6] ✗ Failed to test configuration:', error);
      return false;
    }
  }

  /**
   * Test IPC
   */
  private static async testIPC(): Promise<boolean> {
    console.log('[Stage 6] Testing IPC...');

    try {
      const vscode = (window as any).vscode;
      if (!vscode || !vscode.ipcRenderer) {
        console.warn('[Stage 6] ⚠ IPC not available');
        return false;
      }

      const ipc = vscode.ipcRenderer;
      const requiredMethods = ['send', 'invoke', 'on', 'once', 'removeListener'];
      const hasMethods = requiredMethods.every(method => typeof ipc[method] === 'function');
      
      console.log(`[Stage 6] IPC has required methods: ${hasMethods}`);
      return hasMethods;

    } catch (error) {
      console.error('[Stage 6] ✗ Failed to test IPC:', error);
      return false;
    }
  }

  /**
   * Test services
   */
  private static async testServices(): Promise<boolean> {
    console.log('[Stage 6] Testing services...');

    try {
      const serviceCollection = (window as any).__SERVICE_COLLECTION__;
      if (!serviceCollection) {
        console.warn('[Stage 6] ⚠ Service collection not available');
        return false;
      }

      const requiredMethods = ['set', 'get', 'has'];
      const hasMethods = requiredMethods.every(method => typeof serviceCollection[method] === 'function');
      
      console.log(`[Stage 6] Service collection has required methods: ${hasMethods}`);
      return hasMethods;

    } catch (error) {
      console.error('[Stage 6] ✗ Failed to test services:', error);
      return false;
    }
  }

  /**
   * Check for errors
   */
  private static checkForErrors(): boolean {
    console.log('[Stage 6] Checking for errors...');

    const errorHandler = ErrorHandler.getInstance();
    const errors = errorHandler.getErrors();
    const criticalErrors = errorHandler.getErrorsBySeverity('critical');
    const warnings = errorHandler.getErrorsBySeverity('warning');

    console.log(`[Stage 6] Total errors: ${errors.length}`);
    console.log(`[Stage 6] Critical errors: ${criticalErrors.length}`);
    console.log(`[Stage 6] Warnings: ${warnings.length}`);

    return criticalErrors.length > 0;
  }

  /**
   * Collect health metrics
   */
  private static collectHealthMetrics(): any {
    console.log('[Stage 6] Collecting health metrics...');

    const metrics = {
      // Bootstrap metrics
      bootstrapStartTime: (window as any).__BOOTSTRAP_START_TIME__,
      bootstrapDuration: Date.now() - ((window as any).__BOOTSTRAP_START_TIME__ || Date.now()),
      
      // Environment metrics
      platform: (window as any).__BOOTSTRAP_PLATFORM__,
      mode: (window as any).__BOOTSTRAP_MODE__,
      debug: (window as any).__BOOTSTRAP_DEBUG__,
      
      // DOM metrics
      domReady: (window as any).__BOOTSTRAP_DOM_READY__,
      
      // Performance metrics
      memoryUsage: this.getMemoryUsage(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      
      // Error metrics
      errorCount: ErrorHandler.getInstance().getErrors().length,
      criticalErrorCount: ErrorHandler.getInstance().getErrorsBySeverity('critical').length,
      warningCount: ErrorHandler.getInstance().getErrorsBySeverity('warning').length
    };

    console.log('[Stage 6] ✓ Health metrics collected');
    return metrics;
  }

  /**
   * Get memory usage
   */
  private static getMemoryUsage(): any {
    console.log('[Stage 6] Getting memory usage...');

    try {
      if (performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        };
      }
      return null;
    } catch (error) {
      console.warn('[Stage 6] ⚠ Failed to get memory usage:', error);
      return null;
    }
  }
}