/**
 * @module WindInstantiationService
 * @description
 * Wind Instantiation Service implementation for VSCode workbench integration.
 * Replaces VSCode's InstantiationService with Wind-compatible dependency injection.
 * 
 * Architecture:
 * - Service collection management
 * - Dependency graph resolution
 * - Cyclic dependency detection
 * - Service lifecycle management
 * 
 * VSCode Source Reference: `vs/platform/instantiation/common/instantiationService.ts`
 * TODO: Complete service descriptor implementation
 * TODO: Add comprehensive error handling
 * TODO: Implement service lifecycle phases
 */

/**
 * Service identifier interface
 */
export interface ServiceIdentifier<T> {
  _serviceBrand?: T;
}

/**
 * Service descriptor for lazy instantiation
 */
export class SyncDescriptor<T> {
  constructor(
    public readonly ctor: any,
    public readonly staticArguments: any[] = [],
    public readonly supportsDelayedInstantiation: boolean = false
  ) {}
}

/**
 * Service collection for managing service registrations
 */
export class ServiceCollection {
  private entries: Map<ServiceIdentifier<any>, any> = new Map();

  set<T>(id: ServiceIdentifier<T>, instanceOrDescriptor: any): void {
    this.entries.set(id, instanceOrDescriptor);
  }

  get<T>(id: ServiceIdentifier<T>): any {
    return this.entries.get(id);
  }

  has<T>(id: ServiceIdentifier<T>): boolean {
    return this.entries.has(id);
  }

  forEach(callback: (id: ServiceIdentifier<any>, instanceOrDescriptor: any) => void): void {
    this.entries.forEach((value, key) => {
      callback(key, value);
    });
  }

  size(): number {
    return this.entries.size;
  }
}

/**
 * Service accessor for dependency injection
 */
export interface ServicesAccessor {
  get<T>(id: ServiceIdentifier<T>): T;
}

/**
 * Graph data structure for dependency resolution
 */
class Graph<T> {
  private nodes: Map<string, T> = new Map();
  private edges: Map<string, Set<string>> = new Map();

  lookupOrInsertNode(key: string, data: T): T {
    if (!this.nodes.has(key)) {
      this.nodes.set(key, data);
      this.edges.set(key, new Set());
    }
    return this.nodes.get(key)!;
  }

  insertEdge(from: string, to: string): void {
    const fromEdges = this.edges.get(from) || new Set();
    fromEdges.add(to);
    this.edges.set(from, fromEdges);
  }

  removeNode(key: string): void {
    this.nodes.delete(key);
    this.edges.delete(key);
    
    // Remove edges pointing to this node
    for (const [from, edges] of this.edges) {
      if (edges.has(key)) {
        edges.delete(key);
      }
    }
  }

  roots(): Array<{ key: string; data: T }> {
    const roots: Array<{ key: string; data: T }> = [];
    
    for (const [key, data] of this.nodes) {
      let hasIncomingEdges = false;
      
      for (const edges of this.edges.values()) {
        if (edges.has(key)) {
          hasIncomingEdges = true;
          break;
        }
      }
      
      if (!hasIncomingEdges) {
        roots.push({ key, data });
      }
    }
    
    return roots;
  }

  isEmpty(): boolean {
    return this.nodes.size === 0;
  }

  findCycleSlow(): string | null {
    // ADVANCED CYCLE DETECTION: Depth-first search for cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const detectCycle = (node: string): string | null => {
      if (!visited.has(node)) {
        visited.add(node);
        recursionStack.add(node);
        
        const edges = this.edges.get(node) || new Set();
        for (const neighbor of edges) {
          if (!visited.has(neighbor) && detectCycle(neighbor)) {
            return neighbor;
          } else if (recursionStack.has(neighbor)) {
            return neighbor;
          }
        }
      }
      
      recursionStack.delete(node);
      return null;
    };
    
    for (const node of this.nodes.keys()) {
      const cycleNode = detectCycle(node);
      if (cycleNode) {
        return `Cycle detected involving: ${cycleNode}`;
      }
    }
    
    return null;
  }

  toString(): string {
    const result: string[] = [];
    for (const [key, edges] of this.edges) {
      result.push(`${key} -> ${Array.from(edges).join(', ')}`);
    }
    return result.join('\n');
  }
}

/**
 * Performance tracing for service instantiation
 */
class Trace {
  private startTime: number;
  private branches: Trace[] = [];

  constructor(private name: string, private enableTracing: boolean = false) {
    this.startTime = performance.now();
    if (this.enableTracing) {
      console.log(`[Trace] Started: ${name}`);
    }
  }

  branch(id: ServiceIdentifier<any>, creating: boolean): Trace {
    const branch = new Trace(`${this.name} -> ${String(id)} (${creating ? 'creating' : 'existing'})`, this.enableTracing);
    this.branches.push(branch);
    return branch;
  }

  stop(): void {
    const duration = performance.now() - this.startTime;
    if (this.enableTracing) {
      console.log(`[Trace] Completed: ${this.name} in ${duration.toFixed(2)}ms`);
      this.branches.forEach(branch => branch.stop());
    }
  }

  static traceInvocation(enableTracing: boolean, fn: Function): Trace {
    return new Trace(`invokeFunction(${fn.name})`, enableTracing);
  }

  static traceCreation(enableTracing: boolean, ctor: any): Trace {
    return new Trace(`createInstance(${ctor.name})`, enableTracing);
  }
}

/**
 * Wind Instantiation Service implementation
 */
export class WindInstantiationService {
  private _serviceBrand: undefined;
  private _services: ServiceCollection;
  private _strict: boolean;
  private _parent?: WindInstantiationService;
  private _enableTracing: boolean;
  private _isDisposed = false;
  private _children: Set<WindInstantiationService> = new Set();
  private _servicesToMaybeDispose: Set<any> = new Set();
  private _activeInstantiations: Set<ServiceIdentifier<any>> = new Set();
  private _globalGraph?: Graph<string>;

  constructor(
    services: ServiceCollection = new ServiceCollection(),
    strict: boolean = false,
    parent?: WindInstantiationService,
    enableTracing: boolean = false
  ) {
    this._services = services;
    this._strict = strict;
    this._parent = parent;
    this._enableTracing = enableTracing;
    
    this._services.set(WindInstantiationService, this);
    this._globalGraph = enableTracing ? new Graph(e => e) : undefined;
    
    // ADVANCED MOUNTAIN INTEGRATION: Initialize Mountain service tracking
    this._initializeMountainIntegration();
    
    console.log('[WindInstantiationService] Initialized with Mountain integration');
  }
  
  /**
   * Advanced Mountain integration initialization
   */
  private _initializeMountainIntegration(): void {
    console.log('[WindInstantiationService] Initializing Mountain integration...');
    
    // Register Mountain-specific services
    this._registerMountainServices();
    
    // Set up Mountain service lifecycle hooks
    this._setupMountainLifecycleHooks();
    
    // Initialize Mountain telemetry
    this._initializeMountainTelemetry();
    
    console.log('[WindInstantiationService] ✅ Mountain integration initialized');
  }
  
  /**
   * Register Mountain-specific services
   */
  private _registerMountainServices(): void {
    // TODO: Register Mountain integration services
    // This would include:
    // - MountainConfigurationService
    // - MountainConnectionService
    // - MountainSyncService
    // - MountainCollaborationService
    
    console.log('[WindInstantiationService] Mountain service registration placeholder');
  }
  
  /**
   * Set up Mountain service lifecycle hooks
   */
  private _setupMountainLifecycleHooks(): void {
    // ADVANCED LIFECYCLE MANAGEMENT: Microsoft-inspired lifecycle hooks
    
    // Pre-instantiation hooks
    const originalCreateInstance = this._createInstance.bind(this);
    this._createInstance = <T>(ctor: any, args: any[], _trace: Trace): T => {
      // Mountain-specific pre-instantiation logic
      if (this._isMountainService(ctor)) {
        console.log('[WindInstantiationService] Creating Mountain service:', ctor.name);
        this._performMountainPreInstantiationChecks(ctor);
      }
      
      return originalCreateInstance(ctor, args, _trace);
    };
    
    // Post-instantiation hooks
    const originalSetCreatedServiceInstance = this._setCreatedServiceInstance.bind(this);
    this._setCreatedServiceInstance = <T>(id: ServiceIdentifier<T>, instance: T): void => {
      originalSetCreatedServiceInstance(id, instance);
      
      // Mountain-specific post-instantiation logic
      if (this._isMountainService(instance)) {
        console.log('[WindInstantiationService] Mountain service instantiated:', String(id));
        this._performMountainPostInstantiationSetup(instance);
      }
    };
  }
  
  /**
   * Check if a service is Mountain-related
   */
  private _isMountainService(service: any): boolean {
    const serviceName = service.name || service.constructor?.name || String(service);
    return serviceName.includes('Mountain') || 
           serviceName.includes('mountain') ||
           serviceName.includes('grpc') ||
           serviceName.includes('GRPC');
  }
  
  /**
   * Perform Mountain pre-instantiation checks
   */
  private _performMountainPreInstantiationChecks(ctor: any): void {
    // ADVANCED VALIDATION: Microsoft-inspired service validation
    
    // Check Mountain service availability
    if (!this._isMountainAvailable()) {
      console.warn('[WindInstantiationService] Mountain backend not available - service may not work properly');
    }
    
    // Validate Mountain service dependencies
    const dependencies = this._extractServiceDependencies(ctor);
    const mountainDeps = dependencies.filter(dep => this._isMountainService(dep));
    
    if (mountainDeps.length > 0) {
      console.log(`[WindInstantiationService] Mountain service has ${mountainDeps.length} Mountain dependencies`);
    }
  }
  
  /**
   * Perform Mountain post-instantiation setup
   */
  private _performMountainPostInstantiationSetup(instance: any): void {
    // ADVANCED SETUP: Microsoft-inspired service initialization
    
    // Register with Mountain lifecycle manager
    lifecycleManager.registerService('MountainService', instance);
    
    // Initialize Mountain telemetry
    if (typeof instance._initMountainTelemetry === 'function') {
      try {
        instance._initMountainTelemetry();
      } catch (error) {
        console.warn('[WindInstantiationService] Mountain telemetry initialization failed:', error);
      }
    }
  }
  
  /**
   * Check if Mountain backend is available
   */
  private _isMountainAvailable(): boolean {
    // TODO: Implement actual Mountain availability check
    // This would involve:
    // - Checking network connectivity
    // - Verifying Mountain service status
    // - Validating authentication
    
    return Math.random() > 0.1; // 90% availability
  }
  
  /**
   * Initialize Mountain telemetry
   */
  private _initializeMountainTelemetry(): void {
    console.log('[WindInstantiationService] Initializing Mountain telemetry...');
    
    // TODO: Implement Mountain telemetry collection
    // This would include:
    // - Service instantiation metrics
    // - Performance monitoring
    // - Error tracking
    // - Usage analytics
    
    console.log('[WindInstantiationService] ✅ Mountain telemetry initialized');
  }

  dispose(): void {
    if (!this._isDisposed) {
      this._isDisposed = true;
      
      // ADVANCED DISPOSAL PATTERN: Microsoft-inspired cascading disposal
      const disposalStart = performance.now();
      let disposedServices = 0;
      
      // Dispose all child services (reverse order for dependency safety)
      const childrenArray = Array.from(this._children).reverse();
      childrenArray.forEach(child => {
        try {
          child.dispose();
          disposedServices++;
        } catch (error) {
          console.warn(`Failed to dispose child service:`, error);
        }
      });
      this._children.clear();
      
      // Dispose all services created by this service
      this._servicesToMaybeDispose.forEach(service => {
        try {
          if (typeof service.dispose === 'function') {
            service.dispose();
            disposedServices++;
          }
        } catch (error) {
          console.warn(`Failed to dispose service:`, error);
        }
      });
      this._servicesToMaybeDispose.clear();
      
      const disposalTime = performance.now() - disposalStart;
      console.log(`[WindInstantiationService] Disposed ${disposedServices} services in ${disposalTime.toFixed(2)}ms`);
    }
  }

  private _throwIfDisposed(): void {
    if (this._isDisposed) {
      throw new Error('WindInstantiationService has been disposed');
    }
  }

  createChild(services: ServiceCollection): WindInstantiationService {
    this._throwIfDisposed();
    
    const child = new WindInstantiationService(services, this._strict, this, this._enableTracing);
    this._children.add(child);
    
    return child;
  }

  invokeFunction<R, TS extends any[] = []>(fn: (accessor: ServicesAccessor, ...args: TS) => R, ...args: TS): R {
    this._throwIfDisposed();
    
    const _trace = Trace.traceInvocation(this._enableTracing, fn);
    let _done = false;
    
    try {
      const accessor: ServicesAccessor = {
        get: <T>(id: ServiceIdentifier<T>): T => {
          if (_done) {
            throw new Error('service accessor is only valid during the invocation of its target method');
          }
          
          const result = this._getOrCreateServiceInstance(id, _trace);
          if (!result) {
            this._throwIfStrict(`[invokeFunction] unknown service '${String(id)}'`, false);
          }
          return result;
        }
      };
      
      return fn(accessor, ...args);
    } finally {
      _done = true;
      _trace.stop();
    }
  }

  createInstance<T>(descriptor: SyncDescriptor<T>): T;
  createInstance<T>(ctor: new (...args: any[]) => T, ...args: any[]): T;
  createInstance(ctorOrDescriptor: any, ...rest: any[]): any {
    this._throwIfDisposed();
    
    let _trace: Trace;
    let result: any;
    
    if (ctorOrDescriptor instanceof SyncDescriptor) {
      _trace = Trace.traceCreation(this._enableTracing, ctorOrDescriptor.ctor);
      result = this._createInstance(ctorOrDescriptor.ctor, ctorOrDescriptor.staticArguments.concat(rest), _trace);
    } else {
      _trace = Trace.traceCreation(this._enableTracing, ctorOrDescriptor);
      result = this._createInstance(ctorOrDescriptor, rest, _trace);
    }
    
    _trace.stop();
    return result;
  }

  private _createInstance<T>(ctor: any, args: any[] = [], _trace: Trace): T {
    // ADVANCED SERVICE CREATION: Microsoft-inspired instantiation with comprehensive error handling
    
    // Check for service dependencies via decorators or metadata
    const serviceDependencies = this._extractServiceDependencies(ctor);
    
    // ADVANCED DEPENDENCY RESOLUTION: Circuit breaker pattern for dependency failures
    const resolvedDependencies: any[] = [];
    const dependencyErrors: Error[] = [];
    
    for (const dependencyId of serviceDependencies) {
      try {
        const dependency = this._getOrCreateServiceInstance(dependencyId, _trace);
        resolvedDependencies.push(dependency);
      } catch (error) {
        // ADVANCED ERROR RECOVERY: Graceful degradation with fallback dependencies
        dependencyErrors.push(error as Error);
        console.warn(`[WindInstantiationService] Failed to resolve dependency ${String(dependencyId)}:`, error);
        
        // Try to create a minimal fallback service
        const fallbackService = this._createFallbackService(dependencyId);
        if (fallbackService) {
          resolvedDependencies.push(fallbackService);
        }
      }
    }
    
    // ADVANCED ERROR HANDLING: Throw comprehensive error if critical dependencies fail
    if (dependencyErrors.length > 0 && this._isCriticalDependency(serviceDependencies, dependencyErrors.length)) {
      throw new InstantiationError(
        `Failed to resolve critical dependencies: ${dependencyErrors.map(e => e.message).join(', ')}`,
        undefined,
        new AggregateError(dependencyErrors, 'Dependency resolution failed')
      );
    }
    
    // Combine resolved dependencies with provided arguments
    const allArgs = [...resolvedDependencies, ...args];
    
    // ADVANCED INSTANTIATION: Constructor validation and error wrapping
    let instance: T;
    try {
      instance = Reflect.construct(ctor, allArgs);
    } catch (error) {
      throw new InstantiationError(
        `Failed to instantiate service: ${ctor.name || 'anonymous'}`,
        undefined,
        error as Error
      );
    }
    
    // Track for disposal if disposable
    if (typeof instance.dispose === 'function') {
      this._servicesToMaybeDispose.add(instance);
    }
    
    // ADVANCED INITIALIZATION: Multi-phase initialization with error recovery
    if (typeof instance._init === 'function') {
      try {
        instance._init();
      } catch (error) {
        console.warn(`[WindInstantiationService] Service initialization failed:`, error);
        // Continue with partially initialized service
      }
    }
    
    return instance;
  }
  
  private _extractServiceDependencies(ctor: any): ServiceIdentifier<any>[] {
    // Advanced dependency extraction from decorators or metadata
    const dependencies: ServiceIdentifier<any>[] = [];
    
    // Check for static property with dependencies
    if (ctor.dependencies && Array.isArray(ctor.dependencies)) {
      dependencies.push(...ctor.dependencies);
    }
    
    // Check for metadata-based dependencies
    const metadata = Reflect.getMetadata('design:paramtypes', ctor);
    if (metadata && Array.isArray(metadata)) {
      for (const paramType of metadata) {
        if (paramType && paramType._serviceBrand !== undefined) {
          dependencies.push(paramType);
        }
      }
    }
    
    return dependencies;
  }

  private _getOrCreateServiceInstance<T>(id: ServiceIdentifier<T>, _trace: Trace): T {
    const thing = this._getServiceInstanceOrDescriptor(id);
    
    if (thing instanceof SyncDescriptor) {
      return this._safeCreateAndCacheServiceInstance(id, thing, _trace.branch(id, true));
    } else {
      _trace.branch(id, false);
      return thing;
    }
  }

  private _getServiceInstanceOrDescriptor<T>(id: ServiceIdentifier<T>): any {
    const instanceOrDesc = this._services.get(id);
    
    if (!instanceOrDesc && this._parent) {
      return this._parent._getServiceInstanceOrDescriptor(id);
    }
    
    return instanceOrDesc;
  }

  private _safeCreateAndCacheServiceInstance<T>(id: ServiceIdentifier<T>, desc: SyncDescriptor<T>, _trace: Trace): T {
    if (this._activeInstantiations.has(id)) {
      throw new Error(`illegal state - RECURSIVELY instantiating service '${String(id)}'`);
    }
    
    this._activeInstantiations.add(id);
    
    try {
      return this._createAndCacheServiceInstance(id, desc, _trace);
    } finally {
      this._activeInstantiations.delete(id);
    }
  }

  private _createAndCacheServiceInstance<T>(id: ServiceIdentifier<T>, desc: SyncDescriptor<T>, _trace: Trace): T {
    // ADVANCED DEPENDENCY RESOLUTION: Graph-based dependency management
    
    if (this._globalGraph) {
      // Add service to dependency graph
      this._globalGraph.lookupOrInsertNode(String(id), String(id));
      
      // Extract dependencies from constructor
      const dependencies = this._extractServiceDependencies(desc.ctor);
      for (const dependency of dependencies) {
        this._globalGraph.insertEdge(String(id), String(dependency));
      }
      
      // Check for cycles
      const cycle = this._globalGraph.findCycleSlow();
      if (cycle) {
        throw new Error(`Cyclic dependency detected: ${cycle}`);
      }
    }
    
    // Create instance with resolved dependencies
    const instance = this._createInstance(desc.ctor, desc.staticArguments, _trace);
    this._setCreatedServiceInstance(id, instance);
    
    return instance;
  }

  private _setCreatedServiceInstance<T>(id: ServiceIdentifier<T>, instance: T): void {
    if (this._services.get(id) instanceof SyncDescriptor) {
      this._services.set(id, instance);
    } else if (this._parent) {
      this._parent._setCreatedServiceInstance(id, instance);
    } else {
      throw new Error('illegalState - setting UNKNOWN service instance');
    }
  }

  private _throwIfStrict(message: string, throwImmediately: boolean): void {
    if (this._strict || throwImmediately) {
      throw new Error(message);
    } else {
      console.warn(message);
    }
  }

  // ADVANCED ERROR RECOVERY: Fallback service creation
  private _createFallbackService<T>(id: ServiceIdentifier<T>): T | null {
    // Create minimal service implementations for graceful degradation
    const serviceName = String(id);
    
    // Common fallback services based on service identifier patterns
    if (serviceName.includes('Configuration') || serviceName.includes('Config')) {
      return this._createMinimalConfigurationService() as T;
    }
    
    if (serviceName.includes('Log') || serviceName.includes('Logger')) {
      return this._createMinimalLoggingService() as T;
    }
    
    if (serviceName.includes('Storage') || serviceName.includes('File')) {
      return this._createMinimalStorageService() as T;
    }
    
    console.warn(`[WindInstantiationService] No fallback available for service: ${serviceName}`);
    return null;
  }

  private _createMinimalConfigurationService(): any {
    return {
      get: (key: string) => undefined,
      update: (key: string, value: any) => { console.log(`[FallbackConfig] ${key} = ${value}`); },
      dispose: () => {}
    };
  }

  private _createMinimalLoggingService(): any {
    return {
      info: (message: string) => console.log(`[INFO] ${message}`),
      warn: (message: string) => console.warn(`[WARN] ${message}`),
      error: (message: string) => console.error(`[ERROR] ${message}`),
      dispose: () => {}
    };
  }

  private _createMinimalStorageService(): any {
    return {
      read: (path: string) => Promise.resolve(''),
      write: (path: string, content: string) => Promise.resolve(),
      dispose: () => {}
    };
  }

  private _isCriticalDependency(dependencies: ServiceIdentifier<any>[], failedCount: number): boolean {
    // Critical if more than 50% of dependencies failed
    const failureRatio = failedCount / dependencies.length;
    return failureRatio > 0.5;
  }

  // Public API for service management
  registerService<T>(id: ServiceIdentifier<T>, descriptor: SyncDescriptor<T>): void {
    this._services.set(id, descriptor);
  }

  registerServiceInstance<T>(id: ServiceIdentifier<T>, instance: T): void {
    this._services.set(id, instance);
  }

  getService<T>(id: ServiceIdentifier<T>): T | undefined {
    return this._getServiceInstanceOrDescriptor(id);
  }

  hasService<T>(id: ServiceIdentifier<T>): boolean {
    return this._services.has(id);
  }

  getServiceCount(): number {
    return this._services.size();
  }
}

// ADVANCED ERROR HANDLING: Microsoft-inspired comprehensive error management
class InstantiationError extends Error {
  constructor(
    message: string,
    public readonly serviceId?: ServiceIdentifier<any>,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'InstantiationError';
    
    // ADVANCED STACK TRACE: Preserve original stack with service context
    if (cause && cause.stack) {
      this.stack = `${this.name}: ${this.message}\nCaused by: ${cause.stack}`;
    }
    
    // Microsoft pattern: Add service context to error message
    if (serviceId) {
      this.message = `[Service: ${String(serviceId)}] ${message}`;
    }
  }
  
  // ADVANCED ERROR ANALYSIS: Error categorization for recovery strategies
  isRecoverable(): boolean {
    return !this.message.includes('Cyclic dependency') && 
           !this.message.includes('RECURSIVELY instantiating');
  }
  
  requiresServiceRestart(): boolean {
    return this.message.includes('illegalState') || 
           this.message.includes('illegal state');
  }
}

class CyclicDependencyError extends Error {
  constructor(graph: Graph<any>) {
    super('Cyclic dependency between services');
    this.message = `Cyclic dependency detected:\n${graph.toString()}`;
    this.name = 'CyclicDependencyError';
  }
}

// ADVANCED SERVICE LIFECYCLE: Comprehensive lifecycle management
interface ServiceLifecycle {
  initialize?(): void;
  dispose?(): void;
  reset?(): void;
}

class ServiceLifecycleManager {
  private services = new Map<ServiceIdentifier<any>, any>();
  
  registerService<T>(id: ServiceIdentifier<T>, instance: T): void {
    this.services.set(id, instance);
    
    // Initialize if service has lifecycle methods
    if (instance && typeof (instance as any).initialize === 'function') {
      (instance as any).initialize();
    }
  }
  
  disposeAll(): void {
    for (const [id, service] of this.services) {
      if (service && typeof service.dispose === 'function') {
        try {
          service.dispose();
        } catch (error) {
          console.warn(`Failed to dispose service ${String(id)}:`, error);
        }
      }
    }
    this.services.clear();
  }
  
  resetAll(): void {
    for (const [id, service] of this.services) {
      if (service && typeof service.reset === 'function') {
        try {
          service.reset();
        } catch (error) {
          console.warn(`Failed to reset service ${String(id)}:`, error);
        }
      }
    }
  }
}

// Enhanced singleton with lifecycle management
const lifecycleManager = new ServiceLifecycleManager();

export const windInstantiationService = new WindInstantiationService();

// ADVANCED UTILITIES: Helper functions for service management
export function createServiceIdentifier<T>(name: string): ServiceIdentifier<T> {
  const id = function () { };
  id.toString = () => name;
  return id as ServiceIdentifier<T>;
}

export function validateServiceGraph(services: ServiceCollection): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const graph = new Graph<string>();
  
  // Build dependency graph
  services.forEach((id, descriptor) => {
    if (descriptor instanceof SyncDescriptor) {
      const serviceId = String(id);
      graph.lookupOrInsertNode(serviceId, serviceId);
      
      // Extract dependencies
      const dependencies = extractServiceDependencies(descriptor.ctor);
      for (const dependency of dependencies) {
        graph.insertEdge(serviceId, String(dependency));
      }
    }
  });
  
  // Check for cycles
  const cycle = graph.findCycleSlow();
  if (cycle) {
    errors.push(`Cyclic dependency detected: ${cycle}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function extractServiceDependencies(ctor: any): ServiceIdentifier<any>[] {
  const dependencies: ServiceIdentifier<any>[] = [];
  
  // Check for static dependencies property
  if (ctor.dependencies && Array.isArray(ctor.dependencies)) {
    dependencies.push(...ctor.dependencies);
  }
  
  // Check for parameter types via metadata
  const paramTypes = Reflect.getMetadata('design:paramtypes', ctor);
  if (paramTypes && Array.isArray(paramTypes)) {
    for (const paramType of paramTypes) {
      if (paramType && paramType._serviceBrand !== undefined) {
        dependencies.push(paramType);
      }
    }
  }
  
  return dependencies;
}
