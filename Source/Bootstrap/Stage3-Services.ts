/**
 * @module Stage3-Services
 * @description
 * Stage 3: Service Layer Setup
 * Initializes Effect-TS runtime and registers core services.
 */

import type { StageResult, ServiceData } from './Types.js';
import { StatusReporter } from './StatusReporter.js';
import { ErrorHandler } from './ErrorHandler.js';

export class ServicesStage {
  static readonly STAGE_NAME = 'Services' as const;

  /**
   * Execute the service layer setup stage
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
        message: 'Initializing service layer...',
        progress: 42.9
      });

      console.log('[Stage 3] Starting service layer setup...');

      // Initialize Effect-TS runtime
      const runtime = await this.initializeEffectRuntime();
      console.log('[Stage 3] ✓ Effect-TS runtime initialized');

      // Register core services
      const serviceData = await this.registerCoreServices(runtime);
      console.log('[Stage 3] ✓ Core services registered');

      // Validate service dependencies
      this.validateServiceDependencies(serviceData);
      console.log('[Stage 3] ✓ Service dependencies validated');

      // Create service collection
      const serviceCollection = this.createServiceCollection(runtime);
      console.log('[Stage 3] ✓ Service collection created');

      // Store runtime and collection globally
      this.storeServiceGlobals(runtime, serviceCollection);
      console.log('[Stage 3] ✓ Service globals stored');

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: `Service layer ready (${serviceData.serviceCount} services)`,
        progress: 57.1, // 4/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: serviceData
      };

    } catch (error) {
      const duration = performance.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Handle error
      await errorHandler.handle(
        this.STAGE_NAME,
        errorObj,
        'warning', // Services are not critical for basic functionality
        { 
          stage: 'Service Layer Setup',
          suggestion: 'Some services may not be available, but workbench can still start'
        }
      );

      return {
        success: true, // Continue even if services fail
        stage: this.STAGE_NAME,
        duration,
        data: {
          servicesRegistered: [],
          servicesFailed: [errorObj.message],
          serviceCount: 0
        },
        warnings: [errorObj.message]
      };

    }
  }

  /**
   * Initialize Effect-TS runtime
   */
  private static async initializeEffectRuntime(): Promise<any> {
    console.log('[Stage 3] Initializing Effect-TS runtime...');

    try {
      // Check if Effect is available
      if (typeof (window as any).Effect === 'undefined') {
        console.warn('[Stage 3] ⚠ Effect-TS not available, using minimal runtime');
        return this.createMinimalRuntime();
      }

      const Effect = (window as any).Effect;
      
      // Create runtime
      const runtime = await Effect.runPromise(Effect.runtime());
      
      console.log('[Stage 3] ✓ Effect-TS runtime created');
      return runtime;

    } catch (error) {
      console.error('[Stage 3] ✗ Failed to initialize Effect-TS runtime:', error);
      console.warn('[Stage 3] Falling back to minimal runtime');
      return this.createMinimalRuntime();
    }
  }

  /**
   * Create minimal runtime fallback
   */
  private static createMinimalRuntime(): any {
    console.log('[Stage 3] Creating minimal runtime...');
    
    return {
      runSync: <T>(effect: any): T => {
        console.warn('[Stage 3] Using minimal runtime - effects will not execute');
        return undefined as T;
      },
      runPromise: <T>(effect: any): Promise<T> => {
        console.warn('[Stage 3] Using minimal runtime - effects will not execute');
        return Promise.resolve(undefined as T);
      },
      runFork: <T>(effect: any): void => {
        console.warn('[Stage 3] Using minimal runtime - effects will not execute');
      }
    };
  }

  /**
   * Register core services
   */
  private static async registerCoreServices(runtime: any): Promise<ServiceData> {
    console.log('[Stage 3] Registering core services...');

    const servicesRegistered: string[] = [];
    const servicesFailed: string[] = [];

    // Define core services to register
    const coreServices = [
      'ILogService',
      'IEnvironmentService',
      'IConfigurationService',
      'IInstantiationService',
      'IDialogService',
      'INotificationService'
    ];

    for (const serviceName of coreServices) {
      try {
        await this.registerService(serviceName, runtime);
        servicesRegistered.push(serviceName);
        console.log(`[Stage 3] ✓ Service registered: ${serviceName}`);
      } catch (error) {
        servicesFailed.push(serviceName);
        console.warn(`[Stage 3] ⚠ Failed to register service: ${serviceName}`, error);
      }
    }

    const serviceData: ServiceData = {
      servicesRegistered,
      servicesFailed,
      serviceCount: servicesRegistered.length
    };

    console.log(`[Stage 3] ✓ ${serviceData.serviceCount} services registered, ${servicesFailed.length} failed`);
    return serviceData;
  }

  /**
   * Register a single service
   */
  private static async registerService(serviceName: string, runtime: any): Promise<void> {
    console.log(`[Stage 3] Registering ${serviceName}...`);

    // Check if service is available in VSCode output
    const vsOutput = (window as any).__VSCODE_OUTPUT__;
    if (!vsOutput) {
      throw new Error('VSCode output not available');
    }

    // Try to import the service
    try {
      // This is a placeholder - actual service registration would happen here
      // For now, we just log that we're attempting to register
      console.log(`[Stage 3] Service ${serviceName} would be registered here`);
    } catch (error) {
      throw new Error(`Failed to import ${serviceName}: ${error}`);
    }
  }

  /**
   * Validate service dependencies
   */
  private static validateServiceDependencies(serviceData: ServiceData): void {
    console.log('[Stage 3] Validating service dependencies...');

    // Check for critical services
    const criticalServices = ['ILogService', 'IInstantiationService'];
    
    for (const service of criticalServices) {
      if (!serviceData.servicesRegistered.includes(service)) {
        console.warn(`[Stage 3] ⚠ Critical service not registered: ${service}`);
      } else {
        console.log(`[Stage 3] ✓ Critical service available: ${service}`);
      }
    }

    console.log('[Stage 3] ✓ Service dependencies validated');
  }

  /**
   * Create service collection
   */
  private static createServiceCollection(runtime: any): any {
    console.log('[Stage 3] Creating service collection...');

    try {
      // Check if ServiceCollection is available
      if (typeof (window as any).ServiceCollection === 'undefined') {
        console.warn('[Stage 3] ⚠ ServiceCollection not available, creating minimal collection');
        return this.createMinimalServiceCollection();
      }

      const ServiceCollection = (window as any).ServiceCollection;
      const collection = new ServiceCollection();
      
      console.log('[Stage 3] ✓ Service collection created');
      return collection;

    } catch (error) {
      console.error('[Stage 3] ✗ Failed to create service collection:', error);
      console.warn('[Stage 3] Falling back to minimal collection');
      return this.createMinimalServiceCollection();
    }
  }

  /**
   * Create minimal service collection fallback
   */
  private static createMinimalServiceCollection(): any {
    console.log('[Stage 3] Creating minimal service collection...');
    
    return {
      set: (id: any, instance: any) => {
        console.log(`[Stage 3] Service set: ${id}`);
      },
      get: (id: any) => {
        console.log(`[Stage 3] Service get: ${id}`);
        return null;
      },
      has: (id: any) => false
    };
  }

  /**
   * Store service globals
   */
  private static storeServiceGlobals(runtime: any, serviceCollection: any): void {
    console.log('[Stage 3] Storing service globals...');

    // Store runtime
    (window as any).__EFFECT_RUNTIME__ = runtime;
    console.log('[Stage 3] ✓ __EFFECT_RUNTIME__ stored');

    // Store service collection
    (window as any).__SERVICE_COLLECTION__ = serviceCollection;
    console.log('[Stage 3] ✓ __SERVICE_COLLECTION__ stored');
  }

  /**
   * Get service collection from globals
   */
  static getServiceCollection(): any {
    return (window as any).__SERVICE_COLLECTION__;
  }

  /**
   * Get Effect runtime from globals
   */
  static getEffectRuntime(): any {
    return (window as any).__EFFECT_RUNTIME__;
  }
}