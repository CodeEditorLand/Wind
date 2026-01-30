/**
 * @module TauriConfigurationService
 * @description
 * Tauri Configuration Service implementation for VSCode workbench integration.
 * Replaces Electron's configuration system with Tauri-compatible configuration management.
 *
 * Architecture:
 * - Configuration storage and retrieval
 * - Change event propagation
 * - Configuration validation and migration
 * - Scope-based configuration (APPLICATION, WORKSPACE, PROFILE)
 *
 * VSCode Source Reference: `vs/platform/configuration/common/configuration.ts`
 * TODO: Complete configuration change event system
 * TODO: Implement configuration validation
 * TODO: Add configuration migration support
 */
/**
 * Configuration scope
 */
export declare enum ConfigurationScope {
    APPLICATION = 1,
    WORKSPACE = 2,
    PROFILE = 3
}
/**
 * Configuration change event
 */
export interface IConfigurationChangeEvent {
    affectsConfiguration(section: string): boolean;
    changedConfiguration: Set<string>;
}
/**
 * Configuration service interface
 */
export interface IConfigurationService {
    getValue<T>(key: string, defaultValue?: T, scope?: ConfigurationScope): T;
    updateValue(key: string, value: any, scope?: ConfigurationScope): Promise<void>;
    onDidChangeConfiguration: Event<IConfigurationChangeEvent>;
    inspect<T>(key: string, scope?: ConfigurationScope): {
        value?: T;
        defaultValue?: T;
    };
    keys(): string[];
    reloadConfiguration(): Promise<void>;
}
/**
 * Configuration data structure
 */
interface IConfigurationData {
    [key: string]: any;
    _version?: number;
    _timestamp?: number;
}
/**
 * Tauri Configuration Service implementation
 */
export declare class TauriConfigurationService implements IConfigurationService {
    private configuration;
    private changeEventEmitter;
    private isInitialized;
    constructor();
    /**
     * Initialize configuration service
     */
    private initialize;
    /**
     * Load configuration from Tauri backend
     */
    private loadConfiguration;
    /**
     * Save configuration to Tauri backend
     */
    private saveConfiguration;
    /**
     * Handle configuration conflicts with retry logic
     */
    private handleConfigurationConflict;
    /**
     * Get configuration value
     */
    getValue<T>(key: string, defaultValue?: T, scope?: ConfigurationScope): T;
    /**
     * Get nested value from configuration object
     */
    private getNestedValue;
    /**
     * Set nested value in configuration object
     */
    private setNestedValue;
    /**
     * Update configuration value
     */
    updateValue(key: string, value: any, scope?: ConfigurationScope): Promise<void>;
    /**
     * Validate configuration key
     */
    private validateConfigurationKey;
    /**
     * Validate configuration value
     */
    private validateConfigurationValue;
    /**
     * Validate entire configuration scope
     */
    validateScopeConfiguration(scope: ConfigurationScope): boolean;
    /**
     * Event emitter for configuration changes
     */
    get onDidChangeConfiguration(): Event<IConfigurationChangeEvent>;
    /**
     * Inspect configuration value
     */
    inspect<T>(key: string, scope?: ConfigurationScope): {
        value?: T;
        defaultValue?: T;
    };
    /**
     * Get all configuration keys
     */
    keys(): string[];
    /**
     * Recursively collect configuration keys
     */
    private collectKeys;
    /**
     * Reload configuration
     */
    reloadConfiguration(): Promise<void>;
    /**
     * Get configuration scope data
     */
    getScopeData(scope: ConfigurationScope): IConfigurationData | undefined;
    /**
     * Set configuration scope data
     */
    setScopeData(scope: ConfigurationScope, data: IConfigurationData): Promise<void>;
    /**
     * Check if configuration service is ready
     */
    isReady(): boolean;
    /**
     * Dispose configuration service
     */
    dispose(): void;
}
export declare const tauriConfigurationService: TauriConfigurationService;
export {};
//# sourceMappingURL=TauriConfigurationService.d.ts.map