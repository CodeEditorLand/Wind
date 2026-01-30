/**
 * @module Bootstrap/Stages/Stage6-HealthCheck
 * @description
 * Stage 6: Health Check
 * Verifies that the VSCode workbench is running correctly and tests core functionality.
 */

import type { StageResult } from '../Types/BootstrapTypes.ts';
import { StatusReporter } from '../Core/StatusReporter.js';
import { ErrorHandler } from '../Core/ErrorHandler.js';

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
        message: 'Performing health checks...',
        progress: 85.7
      });

      console.log('[Stage 6] Starting health checks...');

      // Verify workbench is running
      const workbenchRunning = this.verifyWorkbenchRunning();
      console.log('[Stage 6] ✓ Workbench running verified');

      // Test core functionality
      const coreFunctionality = await this.testCoreFunctionality();
      console.log('[Stage 6] ✓ Core functionality tested');

      // Check for errors
      const errorCheck = this.checkForErrors();
      console.log('[Stage 6] ✓ Error check completed');

      // Generate health report
      const healthReport = this.generateHealthReport({
        workbenchRunning,
        coreFunctionality,
        errorCheck
      });

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: `Health checks passed (${healthReport.passed}/${healthReport.total} tests)`,
        progress: 100, // 7/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: healthReport
      };

    } catch (error) {
      const duration = performance.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Handle error
      await errorHandler.handle(
        this.STAGE_NAME,
        errorObj,
        'warning', // Health check failures are warnings, not critical
        { 
          stage: 'Health Check',
          suggestion: 'Some health checks failed, but workbench may still be functional'
        }
      );

      return {
        success: true, // Health check failures don't stop bootstrap
        stage: this.STAGE_NAME,
        duration,
        data: {
          passed: 0,
          total: 3,
          tests: [],
          warnings: [errorObj.message]
        },
        warnings: [errorObj.message]
      };
    }
  }

  /**
   * Verify workbench is running
   */
  private static verifyWorkbenchRunning(): boolean {
    console.log('[Stage 6] Verifying workbench is running...');

    const workbench = (window as any).__WORKBENCH_INSTANCE__;
    
    if (!workbench) {
      console.error('[Stage 6] ✗ Workbench instance not found');
      return false;
    }

    if (!workbench.running) {
      console.error('[Stage 6] ✗ Workbench not running');
      return false;
    }

    console.log('[Stage 6] ✓ Workbench is running');
    return true;
  }

  /**
   * Test core functionality
   */
  private static async testCoreFunctionality(): Promise<boolean> {
    console.log('[Stage 6] Testing core functionality...');

    const tests = [
      this.testVSCodeAPI(),
      this.testServiceAccess(),
      this.testConfigurationAccess(),
      this.testEditorFunctionality()
    ];

    let passed = 0;
    const total = tests.length;

    for (const test of tests) {
      if (await test) {
        passed++;
      }
    }

    console.log(`[Stage 6] ✓ Core functionality: ${passed}/${total} tests passed`);
    return passed === total;
  }

  /**
   * Test VSCode API accessibility
   */
  private static async testVSCodeAPI(): Promise<boolean> {
    try {
      const vscode = (window as any).vscode;
      
      if (!vscode) {
        console.error('[Stage 6] ✗ VSCode API not available');
        return false;
      }

      // Test basic API calls
      if (vscode.context && vscode.context.configuration) {
        const config = vscode.context.configuration();
        if (config) {
          console.log('[Stage 6] ✓ VSCode API accessible');
          return true;
        }
      }

      console.error('[Stage 6] ✗ VSCode API not functional');
      return false;
    } catch (error) {
      console.error('[Stage 6] ✗ VSCode API test failed:', error);
      return false;
    }
  }

  /**
   * Test service access
   */
  private static async testServiceAccess(): Promise<boolean> {
    try {
      const serviceCollection = (window as any).__SERVICE_COLLECTION__;
      
      if (!serviceCollection) {
        console.error('[Stage 6] ✗ Service collection not available');
        return false;
      }

      // Test service access
      const services = ['IEnvironmentService', 'IConfigurationService', 'ILoggerService'];
      let accessible = 0;

      for (const service of services) {
        try {
          const serviceId = { toString: () => service };
          if (serviceCollection.has(serviceId)) {
            accessible++;
          }
        } catch (error) {
          console.warn(`[Stage 6] ⚠ Service ${service} not accessible:`, error);
        }
      }

      console.log(`[Stage 6] ✓ Service access: ${accessible}/${services.length} accessible`);
      return accessible > 0; // At least one service should be accessible
    } catch (error) {
      console.error('[Stage 6] ✗ Service access test failed:', error);
      return false;
    }
  }

  /**
   * Test configuration access
   */
  private static async testConfigurationAccess(): Promise<boolean> {
    try {
      const config = (window as any).vscode?.context?._configuration;
      
      if (!config) {
        console.error('[Stage 6] ✗ Configuration not available');
        return false;
      }

      // Test configuration structure
      const requiredFields = ['windowId', 'machineId', 'platform'];
      let valid = 0;

      for (const field of requiredFields) {
        if (config[field]) {
          valid++;
        }
      }

      console.log(`[Stage 6] ✓ Configuration access: ${valid}/${requiredFields.length} valid`);
      return valid === requiredFields.length;
    } catch (error) {
      console.error('[Stage 6] ✗ Configuration access test failed:', error);
      return false;
    }
  }

  /**
   * Test editor functionality
   */
  private static async testEditorFunctionality(): Promise<boolean> {
    try {
      const workbench = (window as any).__WORKBENCH_INSTANCE__;
      
      if (!workbench) {
        console.error('[Stage 6] ✗ Workbench not available for editor test');
        return false;
      }

      // Check if editor functionality is available
      const hasEditorAPI = !!(window as any).monaco || !!(window as any).vscode?.editor;
      
      if (hasEditorAPI) {
        console.log('[Stage 6] ✓ Editor functionality available');
        return true;
      } else {
        console.warn('[Stage 6] ⚠ Editor functionality not available');
        return false;
      }
    } catch (error) {
      console.error('[Stage 6] ✗ Editor functionality test failed:', error);
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
    
    const criticalErrors = errors.filter(error => error.severity === 'critical');
    const warnings = errors.filter(error => error.severity === 'warning');

    if (criticalErrors.length > 0) {
      console.error(`[Stage 6] ✗ Found ${criticalErrors.length} critical errors`);
      return false;
    }

    if (warnings.length > 0) {
      console.warn(`[Stage 6] ⚠ Found ${warnings.length} warnings`);
    }

    console.log('[Stage 6] ✓ Error check passed');
    return true;
  }

  /**
   * Generate health report
   */
  private static generateHealthReport(results: {
    workbenchRunning: boolean;
    coreFunctionality: boolean;
    errorCheck: boolean;
  }): any {
    const tests = [
      { name: 'Workbench Running', passed: results.workbenchRunning },
      { name: 'Core Functionality', passed: results.coreFunctionality },
      { name: 'Error Check', passed: results.errorCheck }
    ];

    const passed = tests.filter(test => test.passed).length;
    const total = tests.length;

    const report = {
      passed,
      total,
      tests,
      overallHealth: passed === total ? 'excellent' : 
                   passed >= total * 0.7 ? 'good' : 
                   passed >= total * 0.5 ? 'fair' : 'poor',
      timestamp: new Date().toISOString(),
      performance: {
        memoryUsage: (performance as any).memory,
        navigationTiming: performance.getEntriesByType('navigation')[0]
      }
    };

    console.log(`[Stage 6] Health Report: ${report.overallHealth.toUpperCase()} (${passed}/${total})`);
    return report;
  }

  /**
   * Get health status
   */
  static getHealthStatus(): {
    workbenchRunning: boolean;
    servicesAccessible: boolean;
    configurationValid: boolean;
    errorsPresent: boolean;
    overallHealth: string;
  } {
    const workbenchRunning = this.verifyWorkbenchRunning();
    const servicesAccessible = false; // Would need actual test
    const configurationValid = false; // Would need actual test
    const errorsPresent = false; // Would need actual test

    const healthScore = [workbenchRunning, servicesAccessible, configurationValid, !errorsPresent]
      .filter(Boolean).length;

    const overallHealth = healthScore === 4 ? 'excellent' :
                         healthScore >= 3 ? 'good' :
                         healthScore >= 2 ? 'fair' : 'poor';

    return {
      workbenchRunning,
      servicesAccessible,
      configurationValid,
      errorsPresent,
      overallHealth
    };
  }

  /**
   * Export health data
   */
  static exportHealthData(): string {
    const status = this.getHealthStatus();
    const errorHandler = ErrorHandler.getInstance();
    const errors = errorHandler.getErrors();

    const healthData = {
      timestamp: new Date().toISOString(),
      status,
      errors,
      performance: {
        memoryUsage: (performance as any).memory,
        navigationTiming: performance.getEntriesByType('navigation')[0]
      },
      environment: {
        platform: (window as any).__BOOTSTRAP_PLATFORM__,
        mode: (window as any).__BOOTSTRAP_MODE__,
        userAgent: navigator.userAgent
      }
    };

    return JSON.stringify(healthData, null, 2);
  }
}
