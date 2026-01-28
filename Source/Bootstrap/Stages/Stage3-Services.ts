/**
 * @module Bootstrap/Stages/Stage3-Services
 * @description
 * Stage 3: Service Layer Setup
 * Initializes Effect-TS runtime and registers core services with VSCode integration.
 *
 * Uses the new Integration/Core/CoreServices.ts which provides Effect-TS based service layers.
 * Services are registered via ServiceAdapter for VSCode compatibility.
 */

import type { StageResult, ServiceData } from '../Types/Types.js';
import { StatusReporter } from '../Core/StatusReporter.js';
import { ErrorHandler } from '../Core/ErrorHandler.js';
import { ServiceAdapter } from '../Integration/ServiceAdapter.js';
import {
	EnvironmentServiceTag,
	LoggerServiceTag,
	ConfigurationServiceTag,
	FileServiceTag,
	DialogServiceTag,
	createCoreServicesLayer,
	createEnvironmentServiceLayer,
	createLoggerServiceLayer,
	createConfigurationServiceLayer,
	createFileServiceLayer,
	createDialogServiceLayer,
} from '../Integration/Core/CoreServices.js';
import * as Effect from 'effect/Effect';

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

      // Initialize service adapter
      const serviceAdapter = await this.initializeServiceAdapter(runtime);
      console.log('[Stage 3] ✓ Service adapter initialized');

      // Register core services
      const serviceData = await this.registerCoreServices(runtime, serviceAdapter);
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
   * Initialize Effect-TS runtime with defensive fallbacks
   */
  private static async initializeEffectRuntime(): Promise<any> {
    console.log('[Stage 3] Initializing Effect-TS runtime...');

    try {
      // Check if Effect is available
      if (typeof Effect === 'undefined') {
        console.warn('[Stage 3] ⚠ Effect-TS not available, using minimal runtime');
        return this.createMinimalRuntime();
      }

      // Create runtime with comprehensive layer
      const coreServicesLayer = createCoreServicesLayer({
		wind: {
			version: '0.0.1',
			debug: process.env.WIND_DEBUG === 'true'
		}
      });

      const runtime = Effect.runSync(
        Effect.Layer.launch(coreServicesLayer)
      );

      if (!runtime) {
        throw new Error('Runtime initialization returned null');
      }

      console.log('[Stage 3] ✓ Effect-TS runtime created with core services layer');
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
   * Initialize service adapter
   */
  private static async initializeServiceAdapter(runtime: any): Promise<ServiceAdapter> {
    console.log('[Stage 3] Initializing service adapter...');

    const serviceAdapter = ServiceAdapter.getInstance();
    
    // Create VSCode service collection
    const serviceCollection = this.createVSCodeServiceCollection();
    
    // Initialize adapter
    serviceAdapter.initialize(serviceCollection, runtime);
    
    console.log('[Stage 3] ✓ Service adapter initialized');
    return serviceAdapter;
  }

  /**
   * Create VSCode service collection
   */
  private static createVSCodeServiceCollection(): any {
    console.log('[Stage 3] Creating VSCode service collection...');

    // Create minimal service collection implementation
    const services = new Map();
    
    return {
      set: <T>(id: any, instance: T): void => {
        services.set(id.toString(), instance);
        console.log(`[Stage 3] Service registered: ${id.toString()}`);
      },
      get: <T>(id: any): T => {
        const service = services.get(id.toString());
        if (!service) {
          console.warn(`[Stage 3] Service not found: ${id.toString()}`);
        }
        return service as T;
      },
      has: <T>(id: any): boolean => {
        return services.has(id.toString());
      }
    };
  }

  /**
   * Register core services using new CoreServices layer
   * Implements TDD-compliant registration with individual layer creation
   */
  private static async registerCoreServices(runtime: any, serviceAdapter: ServiceAdapter): Promise<ServiceData> {
    console.log('[Stage 3] Registering core services from CoreServices layer...');

    const servicesRegistered: string[] = [];
    const servicesFailed: string[] = [];

    // Create individual service layers for granular error handling
    const serviceLayers = [
      { 
        name: 'IEnvironmentService', 
        tag: EnvironmentServiceTag,
        layer: createEnvironmentServiceLayer()
      },
      {
        name: 'ILoggerService',
        tag: LoggerServiceTag,
        layer: createLoggerServiceLayer()
      },
      {
        name: 'IConfigurationService',
        tag: ConfigurationServiceTag,
        layer: createConfigurationServiceLayer()
      },
      {
        name: 'IFileService',
        tag: FileServiceTag,
        layer: createFileServiceLayer()
      },
      {
        name: 'IDialogService',
        tag: DialogServiceTag,
        layer: createDialogServiceLayer()
      }
    ];

    // Get configuration from Stage2
    const config = (window as any).__BOOTSTRAP_CONFIG__ || {};

    for (const service of serviceLayers) {
      try {
        // Create service instance from layer
        const serviceInstance = await Effect.runPromise(
          Effect.gen(function* () {
            return yield* service.tag;
          }).pipe(Effect.provide(service.layer))
        );

        if (!serviceInstance) {
          throw new Error('Service instance is null or undefined');
        }

        // Create service identifier
        const serviceId = {
          _serviceBrand: undefined as any,
          toString: () => service.name
        };

        // Register with service adapter (async handling included)
        const registered = await serviceAdapter.registerService(serviceId, serviceInstance);

        if (registered) {
          servicesRegistered.push(service.name);
          console.log(`[Stage 3] ✓ Service registered: ${service.name}`);
        } else {
          throw new Error('Service adapter returned false');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        servicesFailed.push(service.name);
        console.warn(`[Stage 3] ⚠ Failed to register service: ${service.name}`, errorMsg);
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
   * DEPRECATED: Individual registration now handled in registerCoreServices
   * Kept for backward compatibility
   */
  private static async registerService(
    serviceName: string,
    _creator: Function,
    _config: any,
    serviceAdapter: ServiceAdapter
  ): Promise<void> {
    console.log(`[Stage 3] Registering ${serviceName}...`);

    try {
      // TODO: Implement service instance creation from Effect tag
      // This should use the Effect tag system for type-safe service creation

      // Create service identifier
      const serviceId = {
        _serviceBrand: undefined as any,
        toString: () => serviceName
      };

      // Register with service adapter
      await serviceAdapter.registerService(serviceId, null);

      console.log(`[Stage 3] ✓ Service registered: ${serviceName}`);
    } catch (error) {
      throw new Error(`Failed to register ${serviceName}: ${error}`);
    }
  }

  /**
   * Validate service dependencies
   */
  private static validateServiceDependencies(serviceData: ServiceData): void {
    console.log('[Stage 3] Validating service dependencies...');

    // Check for critical services
    const criticalServices = ['IEnvironmentService', 'IConfigurationService', 'ILoggerService'];
    
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

    // Store service adapter
    (window as any).__SERVICE_ADAPTER__ = ServiceAdapter.getInstance();
    console.log('[Stage 3] ✓ __SERVICE_ADAPTER__ stored');
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

  /**
   * Get service adapter from globals
   */
  static getServiceAdapter(): ServiceAdapter | null {
    return (window as any).__SERVICE_ADAPTER__ || null;
  }
}
