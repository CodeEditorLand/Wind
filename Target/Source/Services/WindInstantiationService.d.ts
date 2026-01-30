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
 * TODO: Integrate with Mountain gRPC service discovery
 * TODO: Add comprehensive performance monitoring
 * TODO: Implement circuit breaker patterns for dependency failures
 * TODO: Add cross-Element dependency mapping
 * TODO: Implement graceful degradation patterns
 */
/**
 * Service identifier interface - Complete Microsoft pattern implementation
 * Microsoft Source Reference: `vs/platform/instantiation/common/instantiation.ts`
 */
export interface ServiceIdentifier<T> {
    (...args: any[]): void;
    type: T;
    _serviceBrand?: T;
}
/**
 * Branded service interface - Microsoft pattern for service branding
 */
export type BrandedService = {
    _serviceBrand: undefined;
};
export declare function createServiceIdentifier<T>(name: string): ServiceIdentifier<T>;
/**
 * Service descriptor for lazy instantiation - Complete Microsoft pattern implementation
 * Microsoft Source Reference: `vs/platform/instantiation/common/descriptors.ts`
 */
export declare class SyncDescriptor<T> {
    readonly ctor: new (...args: any[]) => T;
    readonly staticArguments: unknown[];
    readonly supportsDelayedInstantiation: boolean;
    constructor(ctor: new (...args: any[]) => T, staticArguments?: unknown[], supportsDelayedInstantiation?: boolean);
}
/**
 * Zero-argument service descriptor - Microsoft pattern for parameterless constructors
 */
export interface SyncDescriptor0<T> {
    readonly ctor: new () => T;
}
/**
 * Service collection for managing service registrations - Complete Microsoft pattern implementation
 * Microsoft Source Reference: `vs/platform/instantiation/common/serviceCollection.ts`
 */
export declare class ServiceCollection {
    private _entries;
    constructor(...entries: [ServiceIdentifier<any>, any][]);
    set<T>(id: ServiceIdentifier<T>, instanceOrDescriptor: T | SyncDescriptor<T>): T | SyncDescriptor<T>;
    has<T>(id: ServiceIdentifier<T>): boolean;
    get<T>(id: ServiceIdentifier<T>): T | SyncDescriptor<T>;
    forEach(callback: (id: ServiceIdentifier<any>, instanceOrDescriptor: any) => void): void;
    size(): number;
    clear(): void;
    [Symbol.iterator](): IterableIterator<[ServiceIdentifier<any>, any]>;
}
/**
 * Service accessor for dependency injection
 */
export interface ServicesAccessor {
    get<T>(id: ServiceIdentifier<T>): T;
}
/**
 * Wind Instantiation Service implementation
 */
export declare class WindInstantiationService {
    private _serviceBrand;
    private _services;
    private _strict;
    private _parent?;
    private _enableTracing;
    private _isDisposed;
    private _children;
    private _servicesToMaybeDispose;
    private _activeInstantiations;
    private _globalGraph?;
    constructor(services?: ServiceCollection, strict?: boolean, parent?: WindInstantiationService, enableTracing?: boolean);
    /**
     * Advanced Mountain integration initialization
     */
    private _initializeMountainIntegration;
    /**
     * Register Mountain-specific services
     */
    private _registerMountainServices;
    /**
     * Set up Mountain service lifecycle hooks
     */
    private _setupMountainLifecycleHooks;
    /**
     * Check if a service is Mountain-related
     */
    private _isMountainService;
    /**
     * Perform Mountain pre-instantiation checks
     */
    private _performMountainPreInstantiationChecks;
    /**
     * Perform Mountain post-instantiation setup
     */
    private _performMountainPostInstantiationSetup;
    /**
     * Check if Mountain backend is available
     */
    private _isMountainAvailable;
    /**
     * Initialize Mountain telemetry
     */
    private _initializeMountainTelemetry;
    dispose(): void;
    private _throwIfDisposed;
    createChild(services: ServiceCollection): WindInstantiationService;
    invokeFunction<R, TS extends any[] = []>(fn: (accessor: ServicesAccessor, ...args: TS) => R, ...args: TS): R;
    createInstance<T>(descriptor: SyncDescriptor<T>): T;
    createInstance<T>(ctor: new (...args: any[]) => T, ...args: any[]): T;
    private _createInstance;
    private _extractServiceDependencies;
    private _extractServiceDependenciesMicrosoftStyle;
    private _getOrCreateServiceInstance;
    private _getServiceInstanceOrDescriptor;
    private _safeCreateAndCacheServiceInstance;
    private _createAndCacheServiceInstance;
    private _setCreatedServiceInstance;
    private _throwIfStrict;
    private _createFallbackService;
    private _createMinimalConfigurationService;
    private _createMinimalLoggingService;
    private _createMinimalStorageService;
    private _isCriticalDependency;
    registerService<T>(id: ServiceIdentifier<T>, descriptor: SyncDescriptor<T>): void;
    registerServiceInstance<T>(id: ServiceIdentifier<T>, instance: T): void;
    getService<T>(id: ServiceIdentifier<T>): T | undefined;
    hasService<T>(id: ServiceIdentifier<T>): boolean;
    getServiceCount(): number;
}
export declare function createDecorator<T>(serviceId: string): ServiceIdentifier<T>;
export declare function validateServiceGraph(services: ServiceCollection): {
    valid: boolean;
    errors: string[];
    warnings: string[];
};
export declare const windInstantiationService: WindInstantiationService;
//# sourceMappingURL=WindInstantiationService.d.ts.map