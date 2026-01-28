/**
 * @module Stage5-Initialization
 * @description
 * Stage 5: Workbench Initialization
 * Creates and starts the VSCode workbench instance.
 */

import type { StageResult, WorkbenchData } from './Types.js';
import { StatusReporter } from './StatusReporter.js';
import { ErrorHandler } from './ErrorHandler.js';

export class InitializationStage {
  static readonly STAGE_NAME = 'Initialization' as const;

  /**
   * Execute the workbench initialization stage
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
        message: 'Initializing workbench...',
        progress: 71.4
      });

      console.log('[Stage 5] Starting workbench initialization...');

      // Get configuration
      const config = this.getConfiguration();
      console.log('[Stage 5] ✓ Configuration retrieved');

      // Get service collection
      const serviceCollection = this.getServiceCollection();
      console.log('[Stage 5] ✓ Service collection retrieved');

      // Create workbench instance
      const workbench = await this.createWorkbench(config, serviceCollection);
      console.log('[Stage 5] ✓ Workbench instance created');

      // Start workbench
      await this.startWorkbench(workbench);
      console.log('[Stage 5] ✓ Workbench started');

      // Validate workbench state
      const workbenchData = this.validateWorkbenchState(workbench);
      console.log('[Stage 5] ✓ Workbench state validated');

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: 'Workbench initialized successfully',
        progress: 85.7, // 6/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: workbenchData
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
          stage: 'Workbench Initialization',
          suggestion: 'Check VSCode workbench scripts and configuration'
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
   * Get configuration from window.vscode.context
   */
  private static getConfiguration(): any {
    console.log('[Stage 5] Getting configuration...');

    const vscode = (window as any).vscode;

    if (!vscode || !vscode.context) {
      throw new Error('window.vscode.context not available');
    }

    const config = vscode.context.configuration();

    if (!config) {
      throw new Error('Configuration not available');
    }

    console.log('[Stage 5] ✓ Configuration retrieved');
    return config;
  }

  /**
   * Get service collection
   */
  private static getServiceCollection(): any {
    console.log('[Stage 5] Getting service collection...');

    const serviceCollection = (window as any).__SERVICE_COLLECTION__;

    if (!serviceCollection) {
      console.warn('[Stage 5] ⚠ Service collection not available, creating minimal collection');
      return this.createMinimalServiceCollection();
    }

    console.log('[Stage 5] ✓ Service collection retrieved');
    return serviceCollection;
  }

  /**
   * Create minimal service collection
   */
  private static createMinimalServiceCollection(): any {
    console.log('[Stage 5] Creating minimal service collection...');

    return {
      set: (id: any, instance: any) => {
        console.log(`[Stage 5] Service set: ${id}`);
      },
      get: (id: any) => {
        console.log(`[Stage 5] Service get: ${id}`);
        return null;
      },
      has: (id: any) => false
    };
  }

  /**
   * Create workbench instance
   */
  private static async createWorkbench(config: any, serviceCollection: any): Promise<any> {
    console.log('[Stage 5] Creating workbench instance...');

    try {
      // Check if Workbench class is available
      if (typeof (window as any).Workbench === 'undefined') {
        console.warn('[Stage 5] ⚠ Workbench class not available');
        console.log('[Stage 5] Workbench will be loaded from external script');
        return null;
      }

      const Workbench = (window as any).Workbench;

      // Create workbench instance with enhanced service integration
      const workbench = new Workbench(
        document.body,
        serviceCollection,
        config
      );

      // Store workbench instance for later reference
      (window as any).__WORKBENCH_INSTANCE__ = workbench;

      console.log('[Stage 5] ✓ Workbench instance created');
      return workbench;

    } catch (error) {
      console.error('[Stage 5] ✗ Failed to create workbench instance:', error);
      throw error;
    }
  }

  /**
   * Start workbench
   */
  private static async startWorkbench(workbench: any): Promise<void> {
    console.log('[Stage 5] Starting workbench...');

    if (!workbench) {
      console.log('[Stage 5] ℹ Workbench instance is null, will be started by external script');
      return;
    }

    try {
      // Check if workbench has startup method
      if (typeof workbench.startup !== 'function') {
        console.warn('[Stage 5] ⚠ workbench.startup not available');
        return;
      }

      // Start workbench with enhanced error handling
      await workbench.startup();

      // Verify workbench started successfully
      if (typeof workbench.isStarted === 'function') {
        const isStarted = workbench.isStarted();
        console.log(`[Stage 5] Workbench started: ${isStarted}`);
      }

      console.log('[Stage 5] ✓ Workbench started');

    } catch (error) {
      console.error('[Stage 5] ✗ Failed to start workbench:', error);
      throw error;
    }
  }

  /**
   * Validate workbench state
   */
  private static validateWorkbenchState(workbench: any): WorkbenchData {
    console.log('[Stage 5] Validating workbench state...');

    const workbenchData: WorkbenchData = {
      initialized: false,
      running: false,
      servicesReady: false
    };

    if (!workbench) {
      console.log('[Stage 5] ℹ Workbench instance is null');
      return workbenchData;
    }

    // Check if workbench is initialized
    workbenchData.initialized = typeof workbench.isStarted === 'function'
      ? workbench.isStarted()
      : true;
    console.log(`[Stage 5] Workbench initialized: ${workbenchData.initialized}`);

    // Check if workbench is running
    workbenchData.running = workbenchData.initialized;
    console.log(`[Stage 5] Workbench running: ${workbenchData.running}`);

    // Check if services are ready
    const serviceCollection = (window as any).__SERVICE_COLLECTION__;
    workbenchData.servicesReady = !!serviceCollection;
    console.log(`[Stage 5] Services ready: ${workbenchData.servicesReady}`);

    // Additional validation: Check for required workbench methods
    const requiredMethods = ['startup', 'shutdown', 'dispose'];
    const hasRequiredMethods = requiredMethods.every(method => typeof workbench[method] === 'function');
    console.log(`[Stage 5] Workbench has required methods: ${hasRequiredMethods}`);

    // Check if workbench has been properly stored
    const storedWorkbench = (window as any).__WORKBENCH_INSTANCE__;
    console.log(`[Stage 5] Workbench stored globally: ${!!storedWorkbench}`);

    console.log('[Stage 5] ✓ Workbench state validated');
    return workbenchData;
  }
}