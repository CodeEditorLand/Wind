/**
 * @module Bootstrap/Integration/CoreServices
 * @description
 * Core VSCode service implementations using Wind services.
 * These services bridge Wind's Effect-TS architecture to VSCode's service requirements.
 */
import type { IVSCodeEnvironmentService, IVSCodeConfigurationService, IVSCodeLoggerService } from '../Types/VSCodeTypes.js';
export declare class CoreServices {
    private static instance;
    private services;
    private constructor();
    /**
     * Get the singleton instance
     */
    static getInstance(): CoreServices;
    /**
     * Create Environment Service implementation
     */
    createEnvironmentService(config: any): IVSCodeEnvironmentService;
    /**
     * Create Configuration Service implementation
     */
    createConfigurationService(config: any): IVSCodeConfigurationService;
    /**
     * Create Logger Service implementation
     */
    createLoggerService(): IVSCodeLoggerService;
    /**
     * Create Instantiation Service implementation
     */
    createInstantiationService(): any;
    /**
     * Create File Service implementation
     */
    createFileService(): any;
    /**
     * Create Notification Service implementation
     */
    createNotificationService(): any;
    /**
     * Create Dialog Service implementation
     */
    createDialogService(): any;
    /**
     * Get service by name
     */
    getService<T>(name: string): T | undefined;
    /**
     * Get all services
     */
    getAllServices(): Map<string, any>;
    /**
     * Get registered service names
     */
    getRegisteredServiceNames(): string[];
    /**
     * Dispose all services
     */
    dispose(): void;
}
//# sourceMappingURL=CoreServices.d.ts.map