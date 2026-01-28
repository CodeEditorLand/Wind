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

// ============================================================================
// TYPES
// ============================================================================

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

/**
 * Log entry structure
 */
interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	data?: unknown;
}

// ============================================================================
// CONTEXT TAG
// ============================================================================

export const LoggerServiceTag = Effect.Context.Tag<LoggerService, LoggerService>(
	'LoggerService'
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Log level order for comparison
 */
const LOG_LEVEL_ORDER: LogLevel[] = ['trace', 'debug', 'info', 'warning', 'error', 'critical'];

/**
 * Get numeric level for comparison
 */
function getLevelValue(level: LogLevel): number {
	return LOG_LEVEL_ORDER.indexOf(level);
}

/**
 * Check if a given level should be logged based on current level
 */
function shouldLog(currentLevel: LogLevel, messageLevel: LogLevel): boolean {
	return getLevelValue(messageLevel) >= getLevelValue(currentLevel);
}

/**
 * Get console color for log level
 */
function getConsoleColor(level: LogLevel): string {
	switch (level) {
		case 'trace':
			return '#9e9e9e'; // gray
		case 'debug':
			return '#2196f3'; // blue
		case 'info':
			return '#4caf50'; // green
		case 'warning':
			return '#ff9800'; // orange
		case 'error':
			return '#f44336'; // red
		case 'critical':
			return '#d32f2f'; // dark red
		default:
			return '#ffffff';
	}
}

/**
 * Format timestamp in ISO format
 */
function formatTimestamp(): string {
	return new Date().toISOString();
}

/**
 * Safe stringify for circular references
 */
function safeStringify(obj: unknown, space?: number): string {
	const seen = new WeakSet();

	return JSON.stringify(
		obj,
		(_key, value) => {
			if (typeof value === 'object' && value !== null) {
				if (seen.has(value)) {
					return '[Circular]';
				}
				seen.add(value);
			}
			return value;
		},
		space
	);
}

/**
 * Extract error information for logging
 */
function getErrorInfo(error: unknown): Record<string, unknown> {
	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
		};
	}
	return { error };
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

class LoggerServiceImpl implements LoggerService {
	private level: LogLevel;
	private enableFileLogging: boolean;
	private logFilePath: string;
	private integrateWithStatusReporter: boolean;
	private logBuffer: LogEntry[];
	private disposed: boolean = false;

	constructor(options: LoggerServiceOptions = {}) {
		this.level = options.level || 'info';
		this.enableFileLogging = options.enableFileLogging || false;
		this.logFilePath = options.logFilePath || 'logs/wind.log';
		this.integrateWithStatusReporter = options.integrateWithStatusReporter || false;
		this.logBuffer = [];
	}

	trace(message: string, ...args: unknown[]): void {
		this.log('trace', message, args);
	}

	debug(message: string, ...args: unknown[]): void {
		this.log('debug', message, args);
	}

	info(message: string, ...args: unknown[]): void {
		this.log('info', message, args);
	}

	warning(message: string, ...args: unknown[]): void {
		this.log('warning', message, args);
	}

	warn(message: string, ...args: unknown[]): void {
		// VSCode compatibility alias
		this.warning(message, ...args);
	}

	error(message: string, ...args: unknown[]): void {
		this.log('error', message, args);
	}

	critical(message: string, ...args: unknown[]): void {
		this.log('critical', message, args);
	}

	setLevel(level: LogLevel): void {
		this.level = level;
	}

	getLevel(): LogLevel {
		return this.level;
	}

	flush: () => Effect.Effect<void> = () => {
		return Effect.gen(function* () {
			if (this.disposed) {
				return;
			}

			// Write buffered logs to file if file logging enabled
			if (this.enableFileLogging && this.logBuffer.length > 0) {
				yield* Effect.tryPromise({
					try: async () => {
						const fs = await import('@tauri-apps/plugin-fs');
						const logContent = this.logBuffer
							.map(entry => `[${entry.timestamp}][${entry.level.toUpperCase()}] ${entry.message}`)
							.join('\n');

						await fs.writeTextFile(this.logFilePath, logContent, {
							append: true,
							create: true,
						});

						// Clear buffer after successful write
						this.logBuffer = [];
					},
					catch: (error) => {
						// Silently fail file logging to not disrupt application
						console.warn(`[LoggerService] Failed to flush logs: ${error}`);
					},
				});
			}
		});
	};

	dispose(): void {
		if (this.disposed) {
			return;
		}

		// Flush before disposal
		Effect.runPromise(this.flush());

		this.disposed = true;
		this.logBuffer = [];
	}

	/**
	 * Core logging method
	 */
	private log(level: LogLevel, message: string, args: unknown[]): void {
		if (this.disposed) {
			return;
		}

		// Check if message should be logged at current level
		if (!shouldLog(this.level, level)) {
			return;
		}

		// Format log entry
		const timestamp = formatTimestamp();
		const data = args.length > 0 ? args[0] : undefined;

		// Add to buffer for file logging
		if (this.enableFileLogging) {
			this.logBuffer.push({
				timestamp,
				level,
				message,
				data,
			});
		}

		// Console output
		this.logToConsole(level, timestamp, message, data);

		// Integrate with StatusReporter for errors
		if (this.integrateWithStatusReporter && (level === 'error' || level === 'critical')) {
			this.notifyStatusReporter(level, message, data);
		}
	}

	/**
	 * Log to console with color coding
	 */
	private logToConsole(level: LogLevel, timestamp: string, message: string, data?: unknown): void {
		const formattedMessage = `[${timestamp}][${level.toUpperCase()}] ${message}`;
		const color = getConsoleColor(level);

		switch (level) {
			case 'trace':
			case 'debug':
				console.debug(`%c${formattedMessage}`, `color: ${color}`, data || '');
				break;
			case 'info':
				console.info(`%c${formattedMessage}`, `color: ${color}`, data || '');
				break;
			case 'warning':
				console.warn(`%c${formattedMessage}`, `color: ${color}`, data || '');
				break;
			case 'error':
			case 'critical':
				const errorInfo = data ? getErrorInfo(data) : undefined;
				console.error(`%c${formattedMessage}`, `color: ${color}`, errorInfo || '');
				break;
		}
	}

	/**
	 * Notify StatusReporter of error
	 */
	private notifyStatusReporter(level: LogLevel, message: string, data?: unknown): void {
		try {
			const { StatusReporter } = require('./../../StatusReporter.js');
			const reporter = StatusReporter.getInstance();

			const error = data instanceof Error ? data : undefined;

			reporter.update({
				stage: 'Logger',
				status: 'error',
				message: `[${level.toUpperCase()}] ${message}`,
				progress: 0, // Progress not applicable
				error,
			});
		} catch {
			// Ignore StatusReporter errors
		}
	}
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create the logger service layer
 * @param options - Logger configuration options
 * @returns Effect-TS layer for LoggerService
 */
export function createLoggerServiceLayer(options?: LoggerServiceOptions): Effect.Layer<never> {
	const loggerService = new LoggerServiceImpl(options);
	return LoggerServiceTag.provide(loggerService);
}

// ============================================================================
// EFFECT-TS WRAPPERS
// ============================================================================

/**
 * Effect wrapper for logging messages
 */
export function logEffect(level: LogLevel, message: string, data?: unknown): Effect.Effect<void> {
	return Effect.gen(function* () {
		const logger = yield* LoggerServiceTag;

		switch (level) {
			case 'trace':
				logger.trace(message, data);
				break;
			case 'debug':
				logger.debug(message, data);
				break;
			case 'info':
				logger.info(message, data);
				break;
			case 'warning':
				logger.warning(message, data);
				break;
			case 'error':
				logger.error(message, data);
				break;
			case 'critical':
				logger.critical(message, data);
				break;
		}
	});
}

/**
 * Effect wrapper for error logging
 */
export function errorEffect(message: string, error?: Error | unknown): Effect.Effect<void> {
	return logEffect('error', message, error);
}

/**
 * Effect wrapper for info logging
 */
export function infoEffect(message: string, data?: unknown): Effect.Effect<void> {
	return logEffect('info', message, data);
}

/**
 * Effect wrapper for debug logging
 */
export function debugEffect(message: string, data?: unknown): Effect.Effect<void> {
	return logEffect('debug', message, data);
}

/**
 * Effect wrapper for trace logging
 */
export function traceEffect(message: string, data?: unknown): Effect.Effect<void> {
	return logEffect('trace', message, data);
}

/**
 * Effect wrapper for warning logging
 */
export function warningEffect(message: string, data?: unknown): Effect.Effect<void> {
	return logEffect('warning', message, data);
}

/**
 * Effect wrapper for critical logging
 */
export function criticalEffect(message: string, error?: Error | unknown): Effect.Effect<void> {
	return logEffect('critical', message, error);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { LoggerService, LoggerServiceOptions };
export default LoggerServiceTag;
