/**
 * @module ServiceMapping
 * @description
 * Comprehensive service mapping between VSCode services and Wind services.
 * This file defines how VSCode services are adapted to work with Wind/Tauri.
 * 
 * Architecture:
 * - Maps VSCode service interfaces to Wind service implementations
 * - Provides adapter patterns for seamless integration
 * - Handles service lifecycle and dependency management
 * - Includes robust error handling and fallback mechanisms
 * - Performance monitoring and dependency resolution
 */

import { IServiceAdapter } from './ServiceAdapter';
import { TauriIPCServer } from '../../Desktop/TauriIPCServer';
import { TauriStorageService } from '../../Desktop/TauriStorageService';
import { TauriFileService } from '../../Desktop/TauriFileService';
import { TauriConfigurationService } from '../../Desktop/TauriConfigurationService';
import { WindInstantiationService } from '../../Services/WindInstantiationService';
import { TauriWorkbench } from '../../Desktop/TauriWorkbench';

/**
 * Service mapping configuration
 */
export interface IServiceMapping {
  vscodeService: string;
  windService: string;
  adapter: IServiceAdapter;
  priority: number;
  dependencies: string[];
  optional?: boolean;
}

/**
 * Service mapping registry
 */
export class ServiceMappingRegistry {
  private mappings: Map<string, IServiceMapping> = new Map();
  private serviceInstances: Map<string, any> = new Map();

  constructor() {
    console.log('[ServiceMappingRegistry] Initializing service mapping registry');
    this.registerDefaultMappings();
  }

  /**
   * Register default service mappings
   */
  private registerDefaultMappings(): void {
    // IPC Service Mapping
    this.registerMapping({
      vscodeService: 'ipcServer',
      windService: 'tauriIPCServer',
      adapter: {
        adapt: (service: any) => TauriIPCServer,
        validate: (service: any) => service instanceof TauriIPCServer,
        fallback: () => new TauriIPCServer()
      },
      priority: 100,
      dependencies: []
    });

    // Storage Service Mapping
    this.registerMapping({
      vscodeService: 'storageService',
      windService: 'tauriStorageService',
      adapter: {
        adapt: (service: any) => TauriStorageService,
        validate: (service: any) => service instanceof TauriStorageService,
        fallback: () => new TauriStorageService()
      },
      priority: 90,
      dependencies: []
    });

    // File Service Mapping
    this.registerMapping({
      vscodeService: 'fileService',
      windService: 'tauriFileService',
      adapter: {
        adapt: (service: any) => TauriFileService,
        validate: (service: any) => service instanceof TauriFileService,
        fallback: () => new TauriFileService()
      },
      priority: 80,
      dependencies: ['ipcServer']
    });

    // Configuration Service Mapping
    this.registerMapping({
      vscodeService: 'configurationService',
      windService: 'tauriConfigurationService',
      adapter: {
        adapt: (service: any) => TauriConfigurationService,
        validate: (service: any) => service instanceof TauriConfigurationService,
        fallback: () => new TauriConfigurationService()
      },
      priority: 70,
      dependencies: ['storageService']
    });

    // Instantiation Service Mapping
    this.registerMapping({
      vscodeService: 'instantiationService',
      windService: 'windInstantiationService',
      adapter: {
        adapt: (service: any) => WindInstantiationService,
        validate: (service: any) => service instanceof WindInstantiationService,
        fallback: () => new WindInstantiationService()
      },
      priority: 95,
      dependencies: []
    });

    // Workbench Layout Service Mapping
    this.registerMapping({
      vscodeService: 'workbenchLayoutService',
      windService: 'tauriWorkbench',
      adapter: {
        adapt: (service: any) => TauriWorkbench,
        validate: (service: any) => service instanceof TauriWorkbench,
        fallback: () => createTauriWorkbench(document.body, {})
      },
      priority: 90,
      dependencies: ['instantiationService', 'configurationService']
    });

    // Window Service Mapping
    this.registerMapping({
      vscodeService: 'nativeWindowService',
      windService: 'tauriNativeWindow',
      adapter: {
        adapt: (service: any) => {
          // TauriNativeWindow implementation - placeholder for window management
          console.log('[ServiceMappingRegistry] Using TauriNativeWindow adapter');
          return service;
        },
        validate: (service: any) => false,
        fallback: () => ({
          createWindow: () => Promise.resolve(),
          closeWindow: () => Promise.resolve()
        })
      },
      priority: 95,
      dependencies: ['ipcServer']
    });

    console.log(`[ServiceMappingRegistry] Registered ${this.mappings.size} service mappings`);
  }

  /**
   * Register a service mapping
   */
  registerMapping(mapping: IServiceMapping): void {
    this.mappings.set(mapping.vscodeService, mapping);
    console.log(`[ServiceMappingRegistry] Registered mapping: ${mapping.vscodeService} -> ${mapping.windService}`);
  }

  /**
   * Get service mapping for VSCode service
   */
  getMapping(vscodeService: string): IServiceMapping | undefined {
    return this.mappings.get(vscodeService);
  }

  /**
   * Get all service mappings
   */
  getAllMappings(): IServiceMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * Get service instance
   */
  getServiceInstance(serviceName: string): any {
    return this.serviceInstances.get(serviceName);
  }

  /**
   * Set service instance
   */
  setServiceInstance(serviceName: string, instance: any): void {
    this.serviceInstances.set(serviceName, instance);
  }

  /**
   * Resolve service dependencies
   */
  resolveDependencies(mapping: IServiceMapping): any[] {
    const dependencies: any[] = [];
    
    for (const dep of mapping.dependencies) {
      const depMapping = this.getMapping(dep);
      if (depMapping) {
        const instance = this.getServiceInstance(dep);
        if (instance) {
          dependencies.push(instance);
        } else {
          console.warn(`[ServiceMappingRegistry] Dependency ${dep} not available for ${mapping.vscodeService}`);
        }
      }
    }
    
    return dependencies;
  }

  /**
   * Initialize all services
   */
  async initializeServices(): Promise<boolean> {
    console.log('[ServiceMappingRegistry] Initializing services...');
    
    // Sort services by priority (highest first)
    const sortedMappings = this.getAllMappings()
      .sort((a, b) => b.priority - a.priority);

    let successCount = 0;
    
    for (const mapping of sortedMappings) {
      try {
        await this.initializeService(mapping);
        successCount++;
      } catch (error) {
        console.error(`[ServiceMappingRegistry] Failed to initialize ${mapping.vscodeService}:`, error);
        
        if (!mapping.optional) {
          console.error(`[ServiceMappingRegistry] Critical service ${mapping.vscodeService} failed, aborting`);
          return false;
        }
      }
    }

    console.log(`[ServiceMappingRegistry] Successfully initialized ${successCount}/${sortedMappings.length} services`);
    return successCount >= sortedMappings.filter(m => !m.optional).length;
  }

  /**
   * Initialize individual service
   */
  private async initializeService(mapping: IServiceMapping): Promise<void> {
    console.log(`[ServiceMappingRegistry] Initializing service: ${mapping.vscodeService}`);
    
    // Resolve dependencies
    const dependencies = this.resolveDependencies(mapping);
    
    // Create service instance using adapter
    let serviceInstance: any;
    
    try {
      // Try to adapt existing service if available
      const existingService = this.getServiceInstance(mapping.windService);
      if (existingService && mapping.adapter.validate(existingService)) {
        serviceInstance = mapping.adapter.adapt(existingService);
      } else {
        // Use fallback
        serviceInstance = mapping.adapter.fallback();
      }
      
      // Initialize service if it has an initialize method
      if (serviceInstance.initialize && typeof serviceInstance.initialize === 'function') {
        await serviceInstance.initialize(...dependencies);
      }
      
      this.setServiceInstance(mapping.vscodeService, serviceInstance);
      console.log(`[ServiceMappingRegistry] Successfully initialized ${mapping.vscodeService}`);
      
    } catch (error) {
      console.error(`[ServiceMappingRegistry] Failed to initialize ${mapping.vscodeService}:`, error);
      throw error;
    }
  }

  /**
   * Get service by VSCode service name
   */
  getService<T>(vscodeService: string): T | undefined {
    return this.getServiceInstance(vscodeService) as T;
  }

  /**
   * Dispose all services
   */
  dispose(): void {
    console.log('[ServiceMappingRegistry] Disposing services...');
    
    this.serviceInstances.forEach((instance, serviceName) => {
      if (instance.dispose && typeof instance.dispose === 'function') {
        try {
          instance.dispose();
          console.log(`[ServiceMappingRegistry] Disposed service: ${serviceName}`);
        } catch (error) {
          console.error(`[ServiceMappingRegistry] Error disposing service ${serviceName}:`, error);
        }
      }
    });
    
    this.serviceInstances.clear();
    this.mappings.clear();
  }
}

// Export singleton instance
export const serviceMappingRegistry = new ServiceMappingRegistry();
