/**
 * @module BootstrapOrchestrator
 * @description
 * Main orchestrator for the atomic bootstrap system.
 * Coordinates all bootstrap stages and manages the overall process.
 */

import type { BootstrapResult, BootstrapConfig, StageResult } from './Types.js';
import { StatusReporter } from './StatusReporter.js';
import { ErrorHandler } from './ErrorHandler.js';
import { EnvironmentStage } from './Stage0-Environment.js';
import { PreloadStage } from './Stage1-Preload.js';
import { ConfigurationStage } from './Stage2-Configuration.js';
import { ServicesStage } from './Stage3-Services.js';
import { PreparationStage } from './Stage4-Preparation.js';
import { InitializationStage } from './Stage5-Initialization.js';
import { HealthCheckStage } from './Stage6-HealthCheck.js';

export class BootstrapOrchestrator {
  private static instance: BootstrapOrchestrator;
  private config: BootstrapConfig;
  private stages: Array<{
    name: string;
    execute: () => Promise<StageResult>;
  }> = [];

  private constructor(config: BootstrapConfig) {
    this.config = config;
    this.initializeStages();
  }

  /**
   * Initialize the orchestrator with configuration
   */
  static initialize(config: BootstrapConfig): BootstrapOrchestrator {
    if (!BootstrapOrchestrator.instance) {
      BootstrapOrchestrator.instance = new BootstrapOrchestrator(config);
    }
    return BootstrapOrchestrator.instance;
  }

  /**
   * Get the orchestrator instance
   */
  static getInstance(): BootstrapOrchestrator {
    if (!BootstrapOrchestrator.instance) {
      throw new Error('BootstrapOrchestrator not initialized. Call initialize() first.');
    }
    return BootstrapOrchestrator.instance;
  }

  /**
   * Initialize all bootstrap stages
   */
  private initializeStages(): void {
    this.stages = [
      { name: 'Environment', execute: () => EnvironmentStage.execute() },
      { name: 'Preload', execute: () => PreloadStage.execute() },
      { name: 'Configuration', execute: () => ConfigurationStage.execute() },
      { name: 'Services', execute: () => ServicesStage.execute() },
      { name: 'Preparation', execute: () => PreparationStage.execute() },
      { name: 'Initialization', execute: () => InitializationStage.execute() },
      { name: 'HealthCheck', execute: () => HealthCheckStage.execute() }
    ];
  }

  /**
   * Execute the entire bootstrap process
   */
  async execute(): Promise<BootstrapResult> {
    const startTime = performance.now();
    const reporter = StatusReporter.getInstance();
    const errorHandler = ErrorHandler.getInstance();

    console.log('[BootstrapOrchestrator] Starting bootstrap process...');
    console.log(`[BootstrapOrchestrator] Configuration:`, this.config);

    // Create status UI
    reporter.createUI();

    const results: StageResult[] = [];
    let overallSuccess = true;

    try {
      // Execute each stage sequentially
      for (const stage of this.stages) {
        console.log(`[BootstrapOrchestrator] Executing stage: ${stage.name}`);

        const result = await stage.execute();
        results.push(result);

        // Update status
        reporter.update({
          stage: stage.name as any,
          status: result.success ? 'success' : 'error',
          message: result.success 
            ? `${stage.name} completed` 
            : `${stage.name} failed`,
          progress: this.calculateProgress(results.length),
          duration: result.duration,
          error: result.error
        });

        // Check if stage failed critically
        if (!result.success && result.critical) {
          console.error(`[BootstrapOrchestrator] ✗ Critical failure in stage: ${stage.name}`);
          overallSuccess = false;
          break;
        }

        // Pause between stages if configured
        if (this.config.pauseBetweenStages) {
          await this.pauseBetweenStages();
        }
      }

      const totalDuration = performance.now() - startTime;

      // Finalize status reporter
      reporter.finalize({
        success: overallSuccess,
        results,
        totalDuration
      });

      // Log summary
      this.logSummary(results, totalDuration, overallSuccess);

      return {
        success: overallSuccess,
        results,
        totalDuration
      };

    } catch (error) {
      const totalDuration = performance.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      console.error('[BootstrapOrchestrator] ✗ Fatal error during bootstrap:', error);

      // Handle fatal error
      await errorHandler.handle(
        'BootstrapOrchestrator',
        errorObj,
        'critical',
        { 
          stage: 'Bootstrap Process',
          suggestion: 'Check console for detailed error information'
        }
      );

      return {
        success: false,
        results,
        totalDuration
      };
    }
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgress(completedStages: number): number {
    const totalStages = this.stages.length;
    return (completedStages / totalStages) * 100;
  }

  /**
   * Pause between stages
   */
  private async pauseBetweenStages(): Promise<void> {
    console.log('[BootstrapOrchestrator] Pausing between stages...');
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[BootstrapOrchestrator] Resuming...');
        resolve();
      }, 1000); // 1 second pause
    });
  }

  /**
   * Log summary of bootstrap process
   */
  private logSummary(results: StageResult[], totalDuration: number, overallSuccess: boolean): void {
    console.log('\n' + '='.repeat(60));
    console.log('[BootstrapOrchestrator] Bootstrap Summary');
    console.log('='.repeat(60));
    console.log(`Overall Status: ${overallSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Total Duration: ${totalDuration.toFixed(0)}ms`);
    console.log(`Stages Completed: ${results.length}/${this.stages.length}`);
    console.log('');

    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      const duration = result.duration.toFixed(0);
      console.log(`  ${index + 1}. ${status} ${result.stage} (${duration}ms)`);
      
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          console.log(`     ⚠ ${warning}`);
        });
      }
    });

    console.log('='.repeat(60) + '\n');
  }

  /**
   * Get bootstrap results
   */
  getResults(): StageResult[] {
    // This would be populated during execution
    return [];
  }

  /**
   * Export diagnostic data
   */
  exportDiagnostics(): string {
    const reporter = StatusReporter.getInstance();
    const errorHandler = ErrorHandler.getInstance();

    const diagnostics = {
      timestamp: new Date().toISOString(),
      config: this.config,
      statusUpdates: reporter.getUpdates(),
      errors: errorHandler.getErrors(),
      environment: {
        platform: (window as any).__BOOTSTRAP_PLATFORM__,
        mode: (window as any).__BOOTSTRAP_MODE__,
        debug: (window as any).__BOOTSTRAP_DEBUG__,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      performance: {
        memoryUsage: (performance as any).memory,
        timing: performance.timing
      }
    };

    return JSON.stringify(diagnostics, null, 2);
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    console.log('[BootstrapOrchestrator] Cleaning up resources...');

    // Remove status UI
    const reporter = StatusReporter.getInstance();
    reporter.removeUI();

    // Remove error UI
    const errorHandler = ErrorHandler.getInstance();
    errorHandler.removeErrorUI();

    console.log('[BootstrapOrchestrator] ✓ Cleanup complete');
  }
}

/**
 * Main entry point for the bootstrap process
 */
export async function bootstrap(config?: Partial<BootstrapConfig>): Promise<BootstrapResult> {
  // Default configuration
  const defaultConfig: BootstrapConfig = {
    debugMode: (window as any).__BOOTSTRAP_DEBUG__ || false,
    verboseLogging: (window as any).__BOOTSTRAP_DEBUG__ || false,
    showStatusUI: true,
    pauseBetweenStages: (window as any).__BOOTSTRAP_DEBUG__ || false,
    enablePerformanceTracking: true
  };

  // Merge with provided config
  const finalConfig = { ...defaultConfig, ...config };

  console.log('[Bootstrap] Starting with configuration:', finalConfig);

  // Initialize orchestrator
  const orchestrator = BootstrapOrchestrator.initialize(finalConfig);

  // Execute bootstrap
  const result = await orchestrator.execute();

  // Clean up if successful
  if (result.success && !finalConfig.showStatusUI) {
    orchestrator.cleanup();
  }

  return result;
}