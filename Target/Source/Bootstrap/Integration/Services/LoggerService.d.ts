/**
 * @module Bootstrap/Integration/Services/LoggerService
 * @description
 * Comprehensive logging service with 6 levels following VSCode ILoggerService interface.
 *
 * Features:
 * - 6 log levels: trace, debug, info, warning, error, critical
 * - Effect-TS wrappers for async logging operations
 * - Console integration with color coding
 * - File-based logging capability (Tauri integration)
 * - Integration with StatusReporter
 * - Full error handling and defensive coding
 *
 * VSCode ILoggerService Methods:
 * - trace(message, ...args)
 * - debug(message, ...args)
 * - info(message, ...args)
 * - warn(message, ...args) / warning(message, ...args)
 * - error(message, ...args)
 * - critical(message, ...args)
 * - flush()
 * - dispose()
 */
import * as Effect from 'effect/Effect';
/**
 * Available log levels ordered by severity
 * Lower values are more verbose
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warning' | 'error' | 'critical';
/**
 * Logger service configuration options
 */
export interface LoggerServiceOptions {
    /** Set minimum log level */
    level?: LogLevel;
    /** Enable file-based logging via Tauri */
    enableFileLogging?: boolean;
    /** Log file path (relative to app data directory) */
    logFilePath?: string;
    /** Integrate with StatusReporter for error logging */
    integrateWithStatusReporter?: boolean;
}
/**
 * Logger service interface matching VSCode ILoggerService
 */
export interface LoggerService {
    /** Trace level (0) - most verbose */
    trace: (message: string, ...args: unknown[]) => void;
    /** Debug level (1) */
    debug: (message: string, ...args: unknown[]) => void;
    /** Info level (2) - default */
    info: (message: string, ...args: unknown[]) => void;
    /** Warning level (3) */
    warning: (message: string, ...args: unknown[]) => void;
    /** Alias for warning (VSCode compatibility) */
    warn: (message: string, ...args: unknown[]) => void;
    /** Error level (4) */
    error: (message: string, ...args: unknown[]) => void;
    /** Critical level (5) - highest severity */
    critical: (message: string, ...args: unknown[]) => void;
    /** Set minimum log level */
    setLevel: (level: LogLevel) => void;
    /** Get current log level */
    getLevel: () => LogLevel;
    /** Flush logs to file (Effect-TS wrapper) */
    flush: () => Effect.Effect<void>;
    /** Dispose logger and cleanup resources */
    dispose: () => void;
}
export declare const LoggerServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => import("effect/Context").TagClass<Self, LoggerService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
};
/**
 * Create the logger service layer
 * @param options - Logger configuration options
 * @returns Effect-TS layer for LoggerService
 */
export declare function createLoggerServiceLayer(options?: LoggerServiceOptions): Effect.Layer<never>;
/**
 * Effect wrapper for logging messages
 */
export declare function logEffect(level: LogLevel, message: string, data?: unknown): Effect.Effect<void>;
/**
 * Effect wrapper for error logging
 */
export declare function errorEffect(message: string, error?: Error | unknown): Effect.Effect<void>;
/**
 * Effect wrapper for info logging
 */
export declare function infoEffect(message: string, data?: unknown): Effect.Effect<void>;
/**
 * Effect wrapper for debug logging
 */
export declare function debugEffect(message: string, data?: unknown): Effect.Effect<void>;
/**
 * Effect wrapper for trace logging
 */
export declare function traceEffect(message: string, data?: unknown): Effect.Effect<void>;
/**
 * Effect wrapper for warning logging
 */
export declare function warningEffect(message: string, data?: unknown): Effect.Effect<void>;
/**
 * Effect wrapper for critical logging
 */
export declare function criticalEffect(message: string, error?: Error | unknown): Effect.Effect<void>;
export type { LoggerService, LoggerServiceOptions };
export default LoggerServiceTag;
//# sourceMappingURL=LoggerService.d.ts.map