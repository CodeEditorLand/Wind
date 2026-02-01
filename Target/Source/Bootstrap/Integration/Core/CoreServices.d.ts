/**
 * @module CoreServices
 * @description
 * Factory functions for creating Wind's core service layers.
 * Each service is implemented as an Effect-TS Layer for composable dependency injection.
 *
 * Services:
 * - EnvironmentService: Platform, language, timezone detection
 * - LoggerService: Structured logging with multiple levels
 * - ConfigurationService: Configuration management with defaults
 * - FileService: Safe file operations via Tauri
 * - DialogService: Native OS dialogs
 *
 * Design Principles:
 * - Defensive coding: All operations wrapped in Effect for error handling
 * - Fallback mechanisms: All services provide sensible defaults
 * - Type safety: Strongly typed interfaces
 * - Testable: Each service can be unit tested independently
 */
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
/**
 * Environment service interface
 * Provides platform detection and runtime environment information
 */
export interface EnvironmentService {
    /** Get current platform: 'tauri' | 'browser' | 'web' */
    getPlatform: () => Effect.Effect<"tauri" | "browser" | "web">;
    /** Get browser language code (e.g., 'en-US') */
    getLanguage: () => Effect.Effect<string>;
    /** Get timezone string (e.g., 'America/New_York') */
    getTimezone: () => Effect.Effect<string>;
    /** Get user agent string */
    getUserAgent: () => Effect.Effect<string>;
    /** Get environment variable with fallback */
    getEnv: (key: string, fallback?: string) => Effect.Effect<string | undefined>;
    /** Check if running in Tauri environment */
    isTauri: () => Effect.Effect<boolean>;
    /** Get OS information */
    getOS: () => Effect.Effect<{
        platform: string;
        arch: string;
        version?: string;
    }>;
}
/**
 * Logger service interface
 * Provides structured logging at multiple levels
 */
export interface LoggerService {
    /** Trace level - most verbose */
    trace: (message: string, data?: Record<string, unknown>) => void;
    /** Debug level */
    debug: (message: string, data?: Record<string, unknown>) => void;
    /** Info level - default */
    info: (message: string, data?: Record<string, unknown>) => void;
    /** Warning level */
    warning: (message: string, data?: Record<string, unknown>) => void;
    /** Error level */
    error: (message: string, error?: Error | unknown) => void;
    /** Critical level - highest severity */
    critical: (message: string, error?: Error | unknown) => void;
    /** Set minimum log level */
    setLevel: (level: LogLevel) => void;
    /** Get current log level */
    getLevel: () => LogLevel;
    /** Flush logs for storage */
    flush: () => Effect.Effect<void>;
}
/**
 * Log levels ordered by severity
 */
export type LogLevel = "trace" | "debug" | "info" | "warning" | "error" | "critical";
/**
 * Configuration service interface
 * Manages application configuration with typed access
 */
export interface ConfigurationService {
    /**
     * Get configuration value by key path
     * @param key - Dot-separated key path (e.g., 'editor.fontSize')
     * @param defaultValue - Fallback value if key not found
     */
    getValue: <T = unknown>(key: string, defaultValue?: T) => Effect.Effect<T | undefined>;
    /**
     * Update configuration value
     * @param key - Dot-separated key path
     * @param value - New value
     */
    updateValue: <T>(key: string, value: T) => Effect.Effect<void>;
    /** Get all configuration */
    getAll: () => Effect.Effect<Record<string, unknown>>;
    /** Reset configuration to defaults */
    reset: () => Effect.Effect<void>;
    /** Watch configuration changes */
    onDidChange: (key: string, callback: (value: unknown) => void) => Effect.Effect<() => void>;
}
/**
 * File service interface
 * Safe file operations with Tauri integration
 */
export interface FileService {
    /**
     * Read file content
     * @param path - File path (absolute or relative to home)
     */
    readFile: (path: string) => Effect.Effect<string>;
    /**
     * Write file content
     * @param path - File path
     * @param content - Content to write
     */
    writeFile: (path: string, content: string) => Effect.Effect<void>;
    /**
     * Check if file/directory exists
     */
    exists: (path: string) => Effect.Effect<boolean>;
    /**
     * Get file statistics
     */
    stat: (path: string) => Effect.Effect<{
        isFile: boolean;
        isDirectory: boolean;
        size: number;
        modified: number;
    }>;
    /**
     * Create directory
     */
    mkdir: (path: string) => Effect.Effect<void>;
    /**
     * Delete file/directory
     */
    delete: (path: string) => Effect.Effect<void>;
    /**
     * Watch file/directory for changes
     * @returns cleanup function to stop watching
     */
    watch: (path: string, callback: () => void) => Effect.Effect<() => void>;
}
/**
 * Dialog service interface
 * Native OS dialogs for file operations and messages
 */
export interface DialogService {
    /**
     * Show open file dialog
     * @param options - Dialog options
     */
    showOpenDialog: (options?: {
        title?: string;
        defaultPath?: string;
        filters?: {
            name: string;
            extensions: string[];
        }[];
        multiple?: boolean;
        directory?: boolean;
    }) => Effect.Effect<string[]>;
    /**
     * Show save file dialog
     * @param options - Dialog options
     */
    showSaveDialog: (options?: {
        title?: string;
        defaultPath?: string;
        filters?: {
            name: string;
            extensions: string[];
        }[];
    }) => Effect.Effect<string | null>;
    /**
     * Show message dialog
     * @param options - Dialog options
     */
    showMessage: (options: {
        title?: string;
        message: string;
        type?: "info" | "warning" | "error";
    }) => Effect.Effect<void>;
}
/** Environment service context tag */
export declare const EnvironmentServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, EnvironmentService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
};
/** Logger service context tag */
export declare const LoggerServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, LoggerService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
};
/** Configuration service context tag */
export declare const ConfigurationServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, ConfigurationService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
};
/** File service context tag */
export declare const FileServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, FileService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
};
/** Dialog service context tag */
export declare const DialogServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, DialogService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
};
/**
 * Create the environment service layer
 * @returns Effect-TS layer for EnvironmentService
 */
export declare const createEnvironmentServiceLayer: () => Layer.Layer<unknown, never, never>;
/**
 * Create the logger service layer
 * @returns Effect-TS layer for LoggerService
 */
export declare const createLoggerServiceLayer: () => Layer.Layer<unknown, never, never>;
/**
 * Create the configuration service layer
 * @param initialConfig - Optional initial configuration
 * @returns Effect-TS layer for ConfigurationService
 */
export declare const createConfigurationServiceLayer: (initialConfig?: Record<string, unknown>) => Layer.Layer<unknown, never, never>;
/**
 * Create the file service layer
 * @returns Effect-TS layer for FileService
 */
export declare const createFileServiceLayer: () => Layer.Layer<unknown, never, never>;
/**
 * Create the dialog service layer
 * @returns Effect-TS layer for DialogService
 */
export declare const createDialogServiceLayer: () => Layer.Layer<unknown, never, never>;
/**
 * Create the complete core services layer
 * Combines all core services into a single composable layer
 * @param initialConfig - Optional initial configuration
 * @returns Composed Effect-TS layer with all core services
 */
export declare const createCoreServicesLayer: (initialConfig?: Record<string, unknown>) => Layer.Layer<unknown, never, never>;
/**
 * VSCode-compatible environment types
 * TODO: Complete VSCode type mapping for full compatibility
 */
export interface VSCodeEnvironment {
    appRoot: string;
    userDataPath: string;
    appName: string;
    appVersion: string;
    remoteAuthority?: string;
}
/**
 * VSCode-compatible configuration types
 * TODO: Complete VSCode config schema integration
 */
export interface VSCodeConfiguration {
    editor?: {
        fontSize?: number;
        fontFamily?: string;
        tabSize?: number;
        wordWrap?: "off" | "on" | "wordWrapColumn" | "bounded";
    };
    files?: {
        autoSave?: "afterDelay" | "onFocusChange" | "onWindowChange" | "off";
        autoSaveDelay?: number;
    };
    terminal?: {
        integrated?: {
            fontSize?: number;
            fontFamily?: string;
        };
    };
}
/**
 * Validate service instance before use
 * @throws Error if service is invalid
 */
export declare function validateService<T>(service: T, serviceName: string): asserts service is T;
/**
 * Safe service accessor with error handling
 * Ensures services are available before use
 */
export declare function safeGetService<T extends Effect.TagClass<any, any>>(tag: T, errorMessage?: string): Effect.Effect<any, unknown, unknown>;
declare const _default: {
    EnvironmentService: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, EnvironmentService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
        use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
    };
    LoggerService: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, LoggerService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
        use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
    };
    ConfigurationService: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, ConfigurationService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
        use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
    };
    FileService: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, FileService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
        use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
    };
    DialogService: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, DialogService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
        use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
    };
    createCoreServicesLayer: (initialConfig?: Record<string, unknown>) => Layer.Layer<unknown, never, never>;
};
export default _default;
//# sourceMappingURL=CoreServices.d.ts.map