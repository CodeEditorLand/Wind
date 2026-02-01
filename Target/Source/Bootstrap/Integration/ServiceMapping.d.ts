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
import { IServiceAdapter } from "./ServiceAdapter";
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
export declare class ServiceMappingRegistry {
    private mappings;
    private serviceInstances;
    constructor();
    /**
     * Register default service mappings
     */
    private registerDefaultMappings;
    /**
     * Register a service mapping
     */
    registerMapping(mapping: IServiceMapping): void;
    /**
     * Get service mapping for VSCode service
     */
    getMapping(vscodeService: string): IServiceMapping | undefined;
    /**
     * Get all service mappings
     */
    getAllMappings(): IServiceMapping[];
    /**
     * Get service instance
     */
    getServiceInstance(serviceName: string): any;
    /**
     * Set service instance
     */
    setServiceInstance(serviceName: string, instance: any): void;
    /**
     * Resolve service dependencies
     */
    resolveDependencies(mapping: IServiceMapping): any[];
    /**
     * Initialize all services
     */
    initializeServices(): Promise<boolean>;
    /**
     * Initialize individual service
     */
    private initializeService;
    /**
     * Get service by VSCode service name
     */
    getService<T>(vscodeService: string): T | undefined;
    /**
     * Dispose all services
     */
    dispose(): void;
}
export declare const serviceMappingRegistry: ServiceMappingRegistry;
//# sourceMappingURL=ServiceMapping.d.ts.map