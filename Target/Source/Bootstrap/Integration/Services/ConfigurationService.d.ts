/**
 * @module Bootstrap/Integration/Services/ConfigurationService
 * @description
 * Configuration management service following VSCode IWorkbenchConfigurationService interface.
 *
 * Features:
 * - Load from Stage2's ISandboxConfiguration
 * - Methods: getValue(key), updateValue(key, value), getConfiguration(sectionId)
 * - Sync with MountainWindSync
 * - Validate against VSCode settings schema
 * - Support config change events
 * - Effect-TS patterns
 *
 * VSCode IWorkbenchConfigurationService Methods:
 * - getValue<T>(section?): T
 * - updateValue(key: string, value: any, target?: ConfigurationTarget): Promise<void>
 * - inspect<T>(key: string): IConfigurationChangeEvent
 */
import * as Effect from 'effect/Effect';
/**
 * Configuration value type
 */
export type ConfigValue = string | number | boolean | null | undefined | object;
/**
 * Configuration change handler type
 */
export type ConfigChangeHandler = (value: unknown) => void;
/**
 * Configuration service interface following VSCode IWorkbenchConfigurationService
 */
export interface ConfigurationService {
    /**
     * Get configuration value by key path
     * @param key - Dot-separated key path (e.g., 'editor.fontSize')
     * @param defaultValue - Fallback value if key not found
     * @returns Effect that resolves to the configuration value
     */
    getValue: <T = ConfigValue>(key: string, defaultValue?: T) => Effect.Effect<T | undefined>;
    /**
     * Update configuration value
     * @param key - Dot-separated key path
     * @param value - New value
     * @returns Effect that completes when update is done
     */
    updateValue: <T>(key: string, value: T) => Effect.Effect<void>;
    /**
     * Get all configuration as a flat object
     */
    getAll: () => Effect.Effect<Record<string, unknown>>;
    /**
     * Reset configuration to defaults
     */
    reset: () => Effect.Effect<void>;
    /**
     * Watch configuration changes
     * @param key - Key path to watch
     * @param callback - Callback function to call on change
     * @returns Effect that resolves to cleanup function
     */
    onDidChange: (key: string, callback: ConfigChangeHandler) => Effect.Effect<() => void>;
    /**
     * Get configuration section (VSCode pattern)
     * @param sectionId - Section identifier (e.g., 'editor')
     * @returns Effect that resolves to section configuration
     */
    getConfiguration: <T = Record<string, unknown>>(sectionId: string) => Effect.Effect<T | undefined>;
    /**
     * Set multiple configuration values at once
     * @param values - Object with key-value pairs
     */
    setMany: (values: Record<string, unknown>) => Effect.Effect<void>;
}
/**
 * Configuration service options
 */
export interface ConfigurationServiceOptions {
    /** Initial configuration values */
    initialConfig?: Record<string, unknown>;
    /** Enable Mountain synchronization */
    enableMountainSync?: boolean;
    /** Enable automatic persistence */
    enablePersistence?: boolean;
    /** Configuration validation schema */
    schema?: Record<string, unknown>;
}
export declare const ConfigurationServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, ConfigurationService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
};
/**
 * Create the configuration service layer
 * @param options - Configuration service options
 * @returns Effect-TS layer for ConfigurationService
 */
export declare function createConfigurationServiceLayer(options?: ConfigurationServiceOptions): Effect.Layer<never>;
/**
 * Effect wrapper for getting configuration value
 */
export declare function getValueEffect<T = ConfigValue>(key: string, defaultValue?: T): Effect.Effect<T | undefined>;
/**
 * Effect wrapper for updating configuration value
 */
export declare function updateValueEffect<T>(key: string, value: T): Effect.Effect<void>;
/**
 * Effect wrapper for getting configuration section
 */
export declare function getConfigurationEffect<T = Record<string, unknown>>(sectionId: string): Effect.Effect<T | undefined>;
/**
 * Effect wrapper for watching configuration changes
 */
export declare function onDidChangeEffect(key: string, callback: ConfigChangeHandler): Effect.Effect<() => void>;
/**
 * Effect wrapper for resetting configuration value
 */
export declare function resetEffect(key: string): Effect.Effect<void>;
/**
 * Effect wrapper for setting multiple configuration values
 */
export declare function setManyEffect(values: Record<string, unknown>): Effect.Effect<void>;
export type { ConfigurationService, ConfigValue, ConfigChangeHandler, ConfigurationServiceOptions };
export default ConfigurationServiceTag;
//# sourceMappingURL=ConfigurationService.d.ts.map