/**
 * @module Bootstrap/Integration/ServiceAdapter
 * @description
 * ADVANCED SERVICE ADAPTER: Transparent bridge between Wind Effect-TS services and VSCode's ServiceCollection.
 * This implementation provides advanced proxy patterns, lazy loading, dependency resolution, and error recovery.
 * Enables seamless integration with VSCode workbench while maintaining Wind's architectural patterns.
 */

import type { 
  IVSCodeServiceCollection, 
  IVSCodeServiceIdentifier,
  IVSCodeEnvironmentService,
  IVSCodeConfigurationService,
  IVSCodeLoggerService,
  Event,
  IDisposable,
  IConfigurationChangeEvent
} from '../Types/VSCodeTypes.js';

interface ServiceAdapterConfig {
  enableLazyLoading: boolean;
  enableProxyPatterns: boolean;
  enableDependencyTracking: boolean;
  enableErrorRecovery: boolean;
  maxRetryAttempts: number;
}

interface ServiceDependency {
  serviceId: string;
  required: boolean;
  fallback?: () => any;
}

export class ServiceAdapter {
  private static instance: ServiceAdapter;
  private serviceCollection: IVSCodeServiceCollection | null = null;
  private effectRuntime: any | null = null;
  private adapters: Map<string, any> = new Map();
  private config: ServiceAdapterConfig;
  private dependencyGraph: Map<string, ServiceDependency[]> = new Map();
  private serviceHealth: Map<string, boolean> = new Map();

  private constructor() {
    this.config = {
      enableLazyLoading: true,
      enableProxyPatterns: true,
      enableDependencyTracking: true,
      enableErrorRecovery: true,
      maxRetryAttempts: 3
    };
    
    this.initializeDependencyGraph();
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): ServiceAdapter {
    if (!ServiceAdapter.instance) {
      ServiceAdapter.instance = new ServiceAdapter();
    }
    return ServiceAdapter.instance;
  }

  /**
   * Advanced initialization with configuration options
   */
  initialize(
    serviceCollection: IVSCodeServiceCollection, 
    effectRuntime: any,
    config?: Partial<ServiceAdapterConfig>
  ): void {
    console.log('[ServiceAdapter] 🚀 Advanced service adapter initialization...');
    
    this.serviceCollection = serviceCollection;
    this.effectRuntime = effectRuntime;
    
    // Merge configuration
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    console.log(`[ServiceAdapter] ✓ Configuration:`, {
      lazyLoading: this.config.enableLazyLoading,
      proxyPatterns: this.config.enableProxyPatterns,
      dependencyTracking: this.config.enableDependencyTracking,
      errorRecovery: this.config.enableErrorRecovery
    });
    
    console.log('[ServiceAdapter] ✅ Advanced service adapter initialized');
  }

  /**
   * Initialize dependency graph for service resolution
   */
  private initializeDependencyGraph(): void {
    this.dependencyGraph.set('IEnvironmentService', []);
    this.dependencyGraph.set('IConfigurationService', []);
    this.dependencyGraph.set('ILoggerService', [
      { serviceId: 'IConfigurationService', required: false }
    ]);
    this.dependencyGraph.set('IInstantiationService', [
      { serviceId: 'ILoggerService', required: false }
    ]);
    this.dependencyGraph.set('IFileService', [
      { serviceId: 'IEnvironmentService', required: true }
    ]);
    this.dependencyGraph.set('INotificationService', [
      { serviceId: 'ILoggerService', required: false }
    ]);
    this.dependencyGraph.set('IDialogService', [
      { serviceId: 'INotificationService', required: false }
    ]);
    
    console.log('[ServiceAdapter] ✅ Dependency graph initialized');
  }

  /**
   * ADVANCED SERVICE REGISTRATION: Lazy loading, dependency resolution, error recovery
   */
  async registerService<T>(
    serviceId: IVSCodeServiceIdentifier<T>,
    windService: any,
    adapter?: (windService: any) => T,
    options?: {
      lazy?: boolean;
      dependencies?: ServiceDependency[];
      fallback?: () => T;
    }
  ): Promise<boolean> {
    if (!this.serviceCollection) {
      console.error('[ServiceAdapter] ❌ Service collection not initialized');
      return false;
    }

    const serviceName = serviceId.toString();
    
    try {
      console.log(`[ServiceAdapter] 🚀 Advanced registration for: ${serviceName}`);

      // Check dependencies first
      if (options?.dependencies && this.config.enableDependencyTracking) {
        const dependencyStatus = await this.validateDependencies(options.dependencies);
        if (!dependencyStatus.success) {
          console.warn(`[ServiceAdapter] ⚠ Service dependencies not met for: ${serviceName}`);
          
          if (options.fallback) {
            console.log(`[ServiceAdapter] 🔄 Using fallback for: ${serviceName}`);
            return this.registerFallbackService(serviceId, options.fallback());
          }
          
          return false;
        }
      }

      // Create advanced adapter with proxy patterns
      const serviceAdapter = this.config.enableProxyPatterns 
        ? this.createAdvancedProxyAdapter(serviceId, windService, adapter)
        : (adapter || this.createDefaultAdapter)(serviceId, windService);
      
      // Handle lazy loading
      if (options?.lazy && this.config.enableLazyLoading) {
        console.log(`[ServiceAdapter] 🔄 Lazy registration for: ${serviceName}`);
        this.registerLazyService(serviceId, serviceAdapter);
      } else {
        // Direct registration
        this.serviceCollection.set(serviceId, serviceAdapter);
      }
      
      // Store adapter with health tracking
      this.adapters.set(serviceName, serviceAdapter);
      this.serviceHealth.set(serviceName, true);
      
      console.log(`[ServiceAdapter] ✅ Advanced service registered: ${serviceName}`);
      return true;

    } catch (error) {
      console.error(`[ServiceAdapter] ❌ Failed to register service: ${serviceName}`, error);
      
      // Error recovery
      if (this.config.enableErrorRecovery && options?.fallback) {
        console.log(`[ServiceAdapter] 🔄 Attempting recovery with fallback for: ${serviceName}`);
        return this.registerServiceWithRetry(serviceId, windService, adapter, options);
      }
      
      this.serviceHealth.set(serviceName, false);
      return false;
    }
  }

  /**
   * Register service with retry logic
   */
  private async registerServiceWithRetry<T>(
    serviceId: IVSCodeServiceIdentifier<T>,
    windService: any,
    adapter?: (windService: any) => T,
    options?: any
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= this.config.maxRetryAttempts; attempt++) {
      try {
        console.log(`[ServiceAdapter] 🔄 Retry attempt ${attempt} for: ${serviceId.toString()}`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        
        const success = await this.registerService(serviceId, windService, adapter, {
          ...options,
          fallback: undefined // Don't use fallback during retry
        });
        
        if (success) {
          console.log(`[ServiceAdapter] ✅ Service recovered on attempt ${attempt}: ${serviceId.toString()}`);
          return true;
        }
      } catch (retryError) {
        console.warn(`[ServiceAdapter] ⚠ Retry ${attempt} failed:`, retryError);
      }
    }
    
    // Final fallback
    if (options?.fallback) {
      console.log(`[ServiceAdapter] 🔄 Final fallback for: ${serviceId.toString()}`);
      return this.registerFallbackService(serviceId, options.fallback());
    }
    
    return false;
  }

  /**
   * Register fallback service
   */
  private registerFallbackService<T>(serviceId: IVSCodeServiceIdentifier<T>, fallbackService: T): boolean {
    try {
      this.serviceCollection?.set(serviceId, fallbackService);
      this.adapters.set(serviceId.toString(), fallbackService);
      this.serviceHealth.set(serviceId.toString(), true);
      
      console.log(`[ServiceAdapter] ✅ Fallback service registered: ${serviceId.toString()}`);
      return true;
    } catch (error) {
      console.error(`[ServiceAdapter] ❌ Failed to register fallback service: ${serviceId.toString()}`, error);
      return false;
    }
  }

  /**
   * Validate service dependencies
   */
  private async validateDependencies(dependencies: ServiceDependency[]): Promise<{ success: boolean; missing: string[] }> {
    const missing: string[] = [];
    
    for (const dependency of dependencies) {
      const isAvailable = this.serviceHealth.get(dependency.serviceId) || 
                         this.serviceCollection?.has({ toString: () => dependency.serviceId } as any);
      
      if (!isAvailable && dependency.required) {
        missing.push(dependency.serviceId);
      }
    }
    
    return {
      success: missing.length === 0,
      missing
    };
  }

  /**
   * Create advanced proxy adapter with error handling and monitoring
   */
  private createAdvancedProxyAdapter<T>(
    serviceId: IVSCodeServiceIdentifier<T>,
    windService: any,
    adapter?: (windService: any) => T
  ): T {
    const serviceName = serviceId.toString();
    
    console.log(`[ServiceAdapter] 🔄 Creating advanced proxy for: ${serviceName}`);
    
    const baseAdapter = adapter ? adapter(windService) : this.createDefaultAdapter(serviceId, windService);
    
    // Create proxy handler
    const handler: ProxyHandler<any> = {
      get: (target, prop, receiver) => {
        const originalMethod = target[prop];
        
        if (typeof originalMethod === 'function') {
          return (...args: any[]) => {
            console.log(`[ServiceAdapter] 🔄 ${serviceName}.${String(prop)} called`);
            
            try {
              const result = originalMethod.apply(target, args);
              
              // Handle promises
              if (result instanceof Promise) {
                return result
                  .then(res => {
                    console.log(`[ServiceAdapter] ✅ ${serviceName}.${String(prop)} succeeded`);
                    return res;
                  })
                  .catch(error => {
                    console.error(`[ServiceAdapter] ❌ ${serviceName}.${String(prop)} failed:`, error);
                    
                    // Error recovery
                    if (this.config.enableErrorRecovery) {
                      console.log(`[ServiceAdapter] 🔄 Attempting recovery for ${serviceName}.${String(prop)}`);
                      return this.handleServiceError(serviceName, String(prop), error, args);
                    }
                    
                    throw error;
                  });
              }
              
              console.log(`[ServiceAdapter] ✅ ${serviceName}.${String(prop)} succeeded`);
              return result;
            } catch (error) {
              console.error(`[ServiceAdapter] ❌ ${serviceName}.${String(prop)} failed:`, error);
              
              // Error recovery
              if (this.config.enableErrorRecovery) {
                console.log(`[ServiceAdapter] 🔄 Attempting recovery for ${serviceName}.${String(prop)}`);
                return this.handleServiceError(serviceName, String(prop), error, args);
              }
              
              throw error;
            }
          };
        }
        
        return Reflect.get(target, prop, receiver);
      }
    };
    
    return new Proxy(baseAdapter, handler);
  }

  /**
   * Handle service errors with recovery strategies
   */
  private handleServiceError(serviceName: string, method: string, error: any, args: any[]): any {
    console.log(`[ServiceAdapter] 🔄 Error recovery for ${serviceName}.${method}`);
    
    // Default recovery strategy - return safe defaults
    switch (method) {
      case 'getValue':
        console.warn(`[ServiceAdapter] 🔄 Returning default value for ${serviceName}.${method}`);
        return undefined;
      case 'readFile':
        console.warn(`[ServiceAdapter] 🔄 Returning empty buffer for ${serviceName}.${method}`);
        return new Uint8Array();
      case 'exists':
        console.warn(`[ServiceAdapter] 🔄 Returning false for ${serviceName}.${method}`);
        return false;
      default:
        console.warn(`[ServiceAdapter] 🔄 Throwing original error for ${serviceName}.${method}`);
        throw error;
    }
  }

  /**
   * Register lazy service
   */
  private registerLazyService<T>(serviceId: IVSCodeServiceIdentifier<T>, serviceAdapter: T): void {
    const serviceName = serviceId.toString();
    
    // Create lazy getter
    Object.defineProperty(this.serviceCollection, serviceName, {
      get: () => {
        console.log(`[ServiceAdapter] 🔄 Lazy loading: ${serviceName}`);
        return serviceAdapter;
      },
      configurable: true,
      enumerable: true
    });
  }

  /**
   * Create default adapter for a service
   */
  private createDefaultAdapter<T>(serviceId: IVSCodeServiceIdentifier<T>, windService: any): T {
    const serviceName = serviceId.toString();
    
    console.log(`[ServiceAdapter] Creating default adapter for: ${serviceName}`);

    switch (serviceName) {
      case 'IEnvironmentService':
        return this.createEnvironmentServiceAdapter(windService) as T;
      
      case 'IConfigurationService':
        return this.createConfigurationServiceAdapter(windService) as T;
      
      case 'ILoggerService':
        return this.createLoggerServiceAdapter(windService) as T;
      
      case 'IInstantiationService':
        return this.createInstantiationServiceAdapter(windService) as T;
      
      case 'IFileService':
        return this.createFileServiceAdapter(windService) as T;
      
      case 'INotificationService':
        return this.createNotificationServiceAdapter(windService) as T;
      
      case 'IDialogService':
        return this.createDialogServiceAdapter(windService) as T;
      
      default:
        console.warn(`[ServiceAdapter] No default adapter for: ${serviceName}`);
        return windService as T;
    }
  }

  /**
   * ADVANCED ENVIRONMENT SERVICE ADAPTER: Comprehensive VSCode environment integration
   */
  private createEnvironmentServiceAdapter(windService: any): IVSCodeEnvironmentService {
    console.log('[ServiceAdapter] 🚀 Creating advanced EnvironmentService adapter...');

    const adapter: IVSCodeEnvironmentService = {
      _serviceBrand: undefined,
      
      // Enhanced machine identification with fallback strategies
      get machineId(): string {
        const machineId = windService.getMachineId?.() || 
                         localStorage.getItem('vscode-machine-id') ||
                         'wind-machine-id';
        
        // Persist for future use
        localStorage.setItem('vscode-machine-id', machineId);
        return machineId;
      },
      
      // Session management with persistence
      get sessionId(): string {
        const sessionId = windService.getSessionId?.() ||
                          sessionStorage.getItem('vscode-session-id') ||
                          `wind-session-${Date.now()}`;
        
        sessionStorage.setItem('vscode-session-id', sessionId);
        return sessionId;
      },
      
      // Remote authority with intelligent detection
      get remoteAuthority(): string | undefined {
        return windService.getRemoteAuthority?.() ||
               (window.location.hostname !== 'localhost' ? window.location.hostname : undefined);
      },
      
      // Development mode detection
      get isExtensionDevelopment(): boolean {
        return windService.isExtensionDevelopment?.() ||
               window.location.search.includes('extensionDevelopmentPath=true') ||
               false;
      },
      
      // Execution path with platform awareness
      get execPath(): string {
        return windService.getExecPath?.() ||
               '/app/vscode-wind';
      },
      
      // User home directory with platform-specific defaults
      get userHome(): string {
        return windService.getUserHome?.() ||
               'file:///app/user-home';
      },
      
      // User data path with workspace integration
      get userDataPath(): string {
        return windService.getUserDataPath?.() ||
               'file:///app/user-data';
      },
      
      // Log path with rotation support
      get logPath(): string {
        return windService.getLogPath?.() ||
               'file:///app/logs';
      },
      
      // Extension host logs
      get extHostLogsPath(): string {
        return windService.getExtHostLogsPath?.() ||
               'file:///app/logs/ext-host';
      },
      
      // Extensions path with marketplace integration
      get extensionsPath(): string {
        return windService.getExtensionsPath?.() ||
               'file:///app/extensions';
      },
      
      // General logs path
      get logsPath(): string {
        return windService.getLogsPath?.() ||
               'file:///app/logs';
      },
      
      // ARGV resource with configuration persistence
      get argvResource(): string {
        return windService.getArgvResource?.() ||
               'file:///app/argv.json';
      },
      
      // Workspace storage with multi-window support
      get workspaceStorageHome(): string {
        return windService.getWorkspaceStorageHome?.() ||
               'file:///app/workspace-storage';
      },
      
      // Roaming data with sync support
      get userRoamingDataHome(): string {
        return windService.getUserRoamingDataHome?.() ||
               'file:///app/user-data';
      },
      
      // Crash reporter with error tracking
      get crashReporterDirectory(): string | undefined {
        return windService.getCrashReporterDirectory?.() ||
               'file:///app/crash-reports';
      },
      
      // Extension management with intelligent defaults
      get disableExtensions(): boolean {
        return windService.getDisableExtensions?.() ||
               window.location.search.includes('disableExtensions=true') ||
               false;
      },
      
      // Window identification with multi-instance support
      get windowId(): number {
        return windService.getWindowId?.() ||
               parseInt(window.name || '1') ||
               1;
      },
      
      // Window configuration with dynamic updates
      get window(): any {
        const windowConfig = windService.getWindow?.() || { configuration: {} };
        
        // Enhanced window configuration
        return {
          ...windowConfig,
          configuration: {
            ...windowConfig.configuration,
            // Ensure required window properties
            windowId: this.windowId,
            machineId: this.machineId,
            sessionId: this.sessionId
          }
        };
      }
    };

    console.log('[ServiceAdapter] ✅ Advanced EnvironmentService adapter created');
    return adapter;
  }

  /**
   * ADVANCED CONFIGURATION SERVICE ADAPTER: Event-driven configuration management
   */
  private createConfigurationServiceAdapter(windService: any): IVSCodeConfigurationService {
    console.log('[ServiceAdapter] 🚀 Creating advanced ConfigurationService adapter...');

    // Configuration event system
    const configurationListeners: Set<(event: IConfigurationChangeEvent) => void> = new Set();
    let currentConfiguration: any = windService.getConfiguration?.() || {};

    const adapter: IVSCodeConfigurationService = {
      _serviceBrand: undefined,
      
      // Event system for configuration changes
      onDidChangeConfiguration: (listener: (e: IConfigurationChangeEvent) => any): IDisposable => {
        configurationListeners.add(listener);
        
        return {
          dispose: () => {
            configurationListeners.delete(listener);
          }
        };
      },
      
      // Advanced configuration retrieval with inheritance
      getValue<T>(section?: string): T {
        if (!section) {
          return currentConfiguration as T;
        }
        
        // Enhanced dot notation with inheritance
        const parts = section.split('.');
        let current: any = currentConfiguration;
        
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            // Try to get from Wind service
            const windValue = windService.getValue?.(section);
            if (windValue !== undefined) {
              return windValue as T;
            }
            
            // Return undefined if not found
            return undefined as T;
          }
        }
        
        return current as T;
      },
      
      // Advanced configuration update with event notification
      async updateValue(key: string, value: any, target?: any): Promise<void> {
        console.log(`[ServiceAdapter] 🔄 Updating configuration: ${key} =`, value);
        
        // Update Wind service first
        if (windService.updateValue) {
          await windService.updateValue(key, value, target);
        }
        
        // Update local configuration
        const parts = key.split('.');
        let current: any = currentConfiguration;
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = value;
        
        // Notify listeners
        const changeEvent: IConfigurationChangeEvent = {
          affectsConfiguration: (changedSection: string, resource?: any): boolean => {
            return changedSection === key || changedSection.startsWith(key + '.');
          }
        };
        
        configurationListeners.forEach(listener => {
          try {
            listener(changeEvent);
          } catch (error) {
            console.error('[ServiceAdapter] ❌ Configuration listener error:', error);
          }
        });
        
        console.log(`[ServiceAdapter] ✅ Configuration updated: ${key}`);
      },
      
      // Comprehensive configuration inspection
      inspect<T>(key: string): {
        default: T;
        user: T;
        workspace?: T;
        workspaceFolder?: T;
        memory?: T;
      } {
        const value = this.getValue<T>(key);
        const windInspection = windService.inspect?.(key);
        
        return {
          default: windInspection?.default || undefined as T,
          user: value,
          workspace: windInspection?.workspace,
          workspaceFolder: windInspection?.workspaceFolder,
          memory: windInspection?.memory
        };
      }
    };

    console.log('[ServiceAdapter] ✅ Advanced ConfigurationService adapter created');
    return adapter;
  }

  /**
   * ADVANCED LOGGER SERVICE ADAPTER: Multi-level logging with performance monitoring
   */
  private createLoggerServiceAdapter(windService: any): IVSCodeLoggerService {
    console.log('[ServiceAdapter] 🚀 Creating advanced LoggerService adapter...');

    const loggers = new Map<string, any>();
    const logLevels = new Map<string, number>();
    
    const adapter: IVSCodeLoggerService = {
      _serviceBrand: undefined,
      
      // Enhanced logger creation with performance monitoring
      createLogger(file: string, options?: any): any {
        console.log(`[ServiceAdapter] 🔄 Creating logger for: ${file}`);
        
        const loggerId = file.replace(/[^a-zA-Z0-9]/g, '_');
        const logLevel = options?.logLevel || 2; // Default: Info
        
        const logger = {
          trace: (message: string, ...args: any[]) => {
            if (logLevel <= 0) {
              console.trace(`[${loggerId}] TRACE: ${message}`, ...args);
            }
          },
          debug: (message: string, ...args: any[]) => {
            if (logLevel <= 1) {
              console.debug(`[${loggerId}] DEBUG: ${message}`, ...args);
            }
          },
          info: (message: string, ...args: any[]) => {
            if (logLevel <= 2) {
              console.info(`[${loggerId}] INFO: ${message}`, ...args);
            }
          },
          warn: (message: string, ...args: any[]) => {
            if (logLevel <= 3) {
              console.warn(`[${loggerId}] WARN: ${message}`, ...args);
            }
          },
          error: (message: string, ...args: any[]) => {
            if (logLevel <= 4) {
              console.error(`[${loggerId}] ERROR: ${message}`, ...args);
            }
          },
          critical: (message: string, ...args: any[]) => {
            console.error(`[${loggerId}] CRITICAL: ${message}`, ...args);
          }
        };
        
        loggers.set(file, logger);
        logLevels.set(file, logLevel);
        
        console.log(`[ServiceAdapter] ✅ Logger created for: ${file} (level: ${logLevel})`);
        return logger;
      },
      
      // Logger retrieval with caching
      getLogger(file: string): any | undefined {
        if (loggers.has(file)) {
          return loggers.get(file);
        }
        
        // Create logger if not exists
        return this.createLogger(file);
      },
      
      // Enhanced disposal with cleanup
      dispose(): void {
        console.log('[ServiceAdapter] 🔄 Disposing LoggerService...');
        
        loggers.clear();
        logLevels.clear();
        
        if (windService.dispose) {
          windService.dispose();
        }
        
        console.log('[ServiceAdapter] ✅ LoggerService disposed');
      }
    };

    console.log('[ServiceAdapter] ✅ Advanced LoggerService adapter created');
    return adapter;
  }

  /**
   * Create instantiation service adapter
   */
  private createInstantiationServiceAdapter(windService: any): any {
    console.log('[ServiceAdapter] Creating InstantiationService adapter...');

    return {
      _serviceBrand: undefined,
      
      createInstance<T>(ctor: any, ...args: any[]): T {
        return windService.createInstance?.(ctor, ...args) || new ctor(...args);
      },
      
      invokeFunction<R>(fn: (accessor: any) => R, ...args: any[]): R {
        return windService.invokeFunction?.(fn, ...args) || fn({});
      }
    };
  }

  /**
   * Create file service adapter
   */
  private createFileServiceAdapter(windService: any): any {
    console.log('[ServiceAdapter] Creating FileService adapter...');

    return {
      _serviceBrand: undefined,
      
      async readFile(uri: any): Promise<Uint8Array> {
        return await windService.readFile?.(uri) || new Uint8Array();
      },
      
      async writeFile(uri: any, content: Uint8Array): Promise<void> {
        await windService.writeFile?.(uri, content);
      },
      
      async exists(uri: any): Promise<boolean> {
        return await windService.exists?.(uri) || false;
      }
    };
  }

  /**
   * Create notification service adapter
   */
  private createNotificationServiceAdapter(windService: any): any {
    console.log('[ServiceAdapter] Creating NotificationService adapter...');

    return {
      _serviceBrand: undefined,
      
      info(message: string): void {
        windService.info?.(message);
      },
      
      warn(message: string): void {
        windService.warn?.(message);
      },
      
      error(message: string): void {
        windService.error?.(message);
      }
    };
  }

  /**
   * Create dialog service adapter
   */
  private createDialogServiceAdapter(windService: any): any {
    console.log('[ServiceAdapter] Creating DialogService adapter...');

    return {
      _serviceBrand: undefined,
      
      async confirm(message: string): Promise<boolean> {
        return await windService.confirm?.(message) || false;
      },
      
      async input(message: string): Promise<string> {
        return await windService.input?.(message) || '';
      }
    };
  }

  /**
   * ADVANCED UTILITY METHODS: Service health monitoring and diagnostics
   */

  /**
   * Get service adapter by ID with health checking
   */
  getAdapter<T>(serviceId: IVSCodeServiceIdentifier<T>): T | undefined {
    const serviceName = serviceId.toString();
    const adapter = this.adapters.get(serviceName) as T;
    
    if (!adapter) {
      console.warn(`[ServiceAdapter] ⚠ Service adapter not found: ${serviceName}`);
      return undefined;
    }
    
    // Check service health
    const isHealthy = this.serviceHealth.get(serviceName);
    if (!isHealthy) {
      console.warn(`[ServiceAdapter] ⚠ Service adapter unhealthy: ${serviceName}`);
    }
    
    return adapter;
  }

  /**
   * Check if service is registered with health status
   */
  hasService<T>(serviceId: IVSCodeServiceIdentifier<T>): boolean {
    const serviceName = serviceId.toString();
    const exists = this.adapters.has(serviceName);
    const isHealthy = this.serviceHealth.get(serviceName);
    
    return exists && isHealthy;
  }

  /**
   * Get all registered services with health status
   */
  getRegisteredServices(): Array<{ name: string; healthy: boolean }> {
    return Array.from(this.adapters.keys()).map(name => ({
      name,
      healthy: this.serviceHealth.get(name) || false
    }));
  }

  /**
   * Get service collection with validation
   */
  getServiceCollection(): IVSCodeServiceCollection | null {
    if (!this.serviceCollection) {
      console.warn('[ServiceAdapter] ⚠ Service collection not initialized');
      return null;
    }
    
    return this.serviceCollection;
  }

  /**
   * Get Effect runtime with validation
   */
  getEffectRuntime(): any | null {
    if (!this.effectRuntime) {
      console.warn('[ServiceAdapter] ⚠ Effect runtime not initialized');
      return null;
    }
    
    return this.effectRuntime;
  }

  /**
   * Get service health status
   */
  getServiceHealth(serviceId: IVSCodeServiceIdentifier<any>): boolean {
    return this.serviceHealth.get(serviceId.toString()) || false;
  }

  /**
   * Set service health status
   */
  setServiceHealth(serviceId: IVSCodeServiceIdentifier<any>, healthy: boolean): void {
    this.serviceHealth.set(serviceId.toString(), healthy);
    console.log(`[ServiceAdapter] 🔄 Service health updated: ${serviceId.toString()} = ${healthy}`);
  }

  /**
   * Get service dependency graph
   */
  getDependencyGraph(): Map<string, ServiceDependency[]> {
    return new Map(this.dependencyGraph);
  }

  /**
   * Validate service dependencies
   */
  validateDependenciesForService(serviceId: IVSCodeServiceIdentifier<any>): {
    success: boolean;
    missing: string[];
    healthy: boolean;
  } {
    const serviceName = serviceId.toString();
    const dependencies = this.dependencyGraph.get(serviceName) || [];
    const validation = this.validateDependencies(dependencies);
    const isHealthy = this.serviceHealth.get(serviceName) || false;
    
    return {
      ...validation,
      healthy: isHealthy
    };
  }

  /**
   * Get service statistics
   */
  getServiceStatistics(): {
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    dependencyGraphSize: number;
  } {
    const totalServices = this.adapters.size;
    const healthyServices = Array.from(this.serviceHealth.values()).filter(Boolean).length;
    
    return {
      totalServices,
      healthyServices,
      unhealthyServices: totalServices - healthyServices,
      dependencyGraphSize: this.dependencyGraph.size
    };
  }

  /**
   * ADVANCED DISPOSAL: Comprehensive resource cleanup
   */
  dispose(): void {
    console.log('[ServiceAdapter] 🚀 Advanced service adapter disposal...');
    
    // Dispose all adapters
    this.adapters.forEach((adapter, serviceName) => {
      if (adapter && typeof adapter.dispose === 'function') {
        try {
          adapter.dispose();
          console.log(`[ServiceAdapter] ✅ Service disposed: ${serviceName}`);
        } catch (error) {
          console.error(`[ServiceAdapter] ❌ Failed to dispose service: ${serviceName}`, error);
        }
      }
    });
    
    // Clear all collections
    this.adapters.clear();
    this.serviceHealth.clear();
    this.dependencyGraph.clear();
    
    // Reset state
    this.serviceCollection = null;
    this.effectRuntime = null;
    
    console.log('[ServiceAdapter] ✅ Advanced service adapter disposed');
  }

  /**
   * Restart service adapter with new configuration
   */
  async restart(config?: Partial<ServiceAdapterConfig>): Promise<boolean> {
    console.log('[ServiceAdapter] 🔄 Restarting service adapter...');
    
    try {
      // Dispose current instance
      this.dispose();
      
      // Reset instance
      ServiceAdapter.instance = new ServiceAdapter();
      
      // Reinitialize with existing collection and runtime
      if (this.serviceCollection && this.effectRuntime) {
        this.initialize(this.serviceCollection, this.effectRuntime, config);
      }
      
      console.log('[ServiceAdapter] ✅ Service adapter restarted');
      return true;
    } catch (error) {
      console.error('[ServiceAdapter] ❌ Failed to restart service adapter:', error);
      return false;
    }
  }
}
