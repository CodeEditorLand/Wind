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

import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Environment service interface
 * Provides platform detection and runtime environment information
 */
export interface EnvironmentService {
	/** Get current platform: 'tauri' | 'browser' | 'web' */
	getPlatform: () => Effect.Effect<'tauri' | 'browser' | 'web'>;

	/** Get browser language code (e.g., 'en-US') */
	getLanguage: () => Effect.Effect<string>;

	/** Get timezone string (e.g., 'America/New_York') */
	getTimezone: () => Effect.Effect<string>;

	/** Get user agent string */
	getUserAgent: () => Effect.Effect<string>;

	/** Get environment variable with fallback */
	getEnv: (
		key: string,
		fallback?: string
	) => Effect.Effect<string | undefined>;

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
export type LogLevel = 'trace' | 'debug' | 'info' | 'warning' | 'error' | 'critical';

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
	getValue: <T = unknown>(
		key: string,
		defaultValue?: T
	) => Effect.Effect<T | undefined>;

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
	onDidChange: (
		key: string,
		callback: (value: unknown) => void
	) => Effect.Effect<() => void>;
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
		filters?: { name: string; extensions: string[] }[];
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
		filters?: { name: string; extensions: string[] }[];
	}) => Effect.Effect<string | null>;

	/**
	 * Show message dialog
	 * @param options - Dialog options
	 */
	showMessage: (options: {
		title?: string;
		message: string;
		type?: 'info' | 'warning' | 'error';
	}) => Effect.Effect<void>;
}

// ============================================================================
// CONTEXT TAGS
// ============================================================================

/** Environment service context tag */
export class EnvironmentServiceTag extends Effect.Tag("EnvironmentService")<
  EnvironmentService,
  EnvironmentService
>() {}

/** Logger service context tag */
export class LoggerServiceTag extends Effect.Tag("LoggerService")<
  LoggerService,
  LoggerService
>() {}

/** Configuration service context tag */
export class ConfigurationServiceTag extends Effect.Tag("ConfigurationService")<
  ConfigurationService,
  ConfigurationService
>() {}

/** File service context tag */
export class FileServiceTag extends Effect.Tag("FileService")<
  FileService,
  FileService
>() {}

/** Dialog service context tag */
export class DialogServiceTag extends Effect.Tag("DialogService")<
  DialogService,
  DialogService
>() {}

// ============================================================================
// SERVICE IMPLEMENTATIONS
// ============================================================================

/**
 * Environment service implementation
 * Detects platform and runtime environment information
 */
const EnvironmentServiceImpl = {
	getPlatform: () =>
		Effect.sync(() => {
			// Check for Tauri environment
			if (typeof (globalThis as any).__TAURI__ !== 'undefined') {
				return 'tauri';
			}
			// Check for standard browser environment
			if (typeof window !== 'undefined' && typeof document !== 'undefined') {
				return 'browser';
			}
			// Fallback to generic web environment
			return 'web';
		}),

	getLanguage: () =>
		Effect.sync(() => {
			if (typeof navigator !== 'undefined' && navigator.language) {
				return navigator.language;
			}
			return 'en-US'; // Fallback
		}),

	getTimezone: () =>
		Effect.sync(() => {
			try {
				if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
					return Intl.DateTimeFormat().resolvedOptions().timeZone;
				}
			} catch {
				// Ignore timezone detection errors
			}
			return 'UTC'; // Fallback
		}),

	getUserAgent: () =>
		Effect.sync(() => {
			if (typeof navigator !== 'undefined' && navigator.userAgent) {
				return navigator.userAgent;
			}
			return 'Wind/1.0.0 (Unknown)'; // Fallback
		}),

	getEnv: (key: string, fallback: string | undefined = undefined) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { invoke } = await import('@tauri-apps/api/core');
						const result = await invoke('get_env_var', { key });
						return result || fallback;
					} catch (error) {
						console.warn(`[EnvironmentService] Failed to get env var ${key}:`, error);
						return fallback;
					}
				}
				// Fallback for non-Tauri environments
				return fallback;
			},
			catch: (error) => {
				console.warn(`[EnvironmentService] Error getting env var ${key}:`, error);
				return fallback;
			}
		}),

	isTauri: () =>
		Effect.sync(() => {
			return typeof (globalThis as any).__TAURI__ !== 'undefined';
		}),

	getOS: () =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { invoke } = await import('@tauri-apps/api/core');
						const osInfo = await invoke('get_os_info');
						return {
							platform: osInfo.platform || 'tauri',
							arch: osInfo.arch || 'unknown',
							version: osInfo.version
						};
					} catch (error) {
						console.warn('[EnvironmentService] Failed to get OS info:', error);
					}
				}
				
				const platform =
					typeof navigator !== 'undefined' && navigator.platform
						? navigator.platform
						: 'unknown';

				// Detect architecture (simplified)
				let arch = 'unknown';
				if (typeof navigator !== 'undefined' && navigator.userAgent) {
					if (navigator.userAgent.includes('x86_64') || navigator.userAgent.includes('x64')) {
						arch = 'x64';
					} else if (navigator.userAgent.includes('arm64') || navigator.userAgent.includes('aarch64')) {
						arch = 'arm64';
					} else if (navigator.userAgent.includes('i686') || navigator.userAgent.includes('x86')) {
						arch = 'x86';
					}
				}

				return { platform, arch };
			},
			catch: (error) => {
				console.warn('[EnvironmentService] Error getting OS info:', error);
				return {
					platform: 'unknown',
					arch: 'unknown'
				};
			}
		}),

};
// Create environment service context tag implementation
const EnvironmentServiceImplWithLayer = {
	service: EnvironmentServiceImpl,
	createLayer: () => Layer.succeed(EnvironmentServiceTag, EnvironmentServiceImpl),
};
/**
 * Logger service implementation
 * Structured logging with multiple levels and output handling
 */
const LoggerServiceImpl: LoggerService = {
	level: 'info' as LogLevel,

	trace: function (message: string, data?: Record<string, unknown>): void {
		if (this.shouldLog('trace')) {
			this.log('TRACE', message, data);
		}
	},

	debug: function (message: string, data?: Record<string, unknown>): void {
		if (this.shouldLog('debug')) {
			this.log('DEBUG', message, data);
		}
	},

	info: function (message: string, data?: Record<string, unknown>): void {
		if (this.shouldLog('info')) {
			this.log('INFO', message, data);
		}
	},

	warning: function (message: string, data?: Record<string, unknown>): void {
		if (this.shouldLog('warning')) {
			this.log('WARN', message, data);
		}
	},

	error: function (message: string, error?: Error | unknown): void {
		if (this.shouldLog('error')) {
			const errorData = error instanceof Error
				? { name: error.name, message: error.message, stack: error.stack }
				: { error };
			this.log('ERROR', message, errorData);
		}
	},

	critical: function (message: string, error?: Error | unknown): void {
		if (this.shouldLog('critical')) {
			const errorData = error instanceof Error
				? { name: error.name, message: error.message, stack: error.stack }
				: { error };
			this.log('CRITICAL', message, errorData);
		}
	},

	setLevel: function (level: LogLevel): void {
		this.level = level;
	},

	getLevel: function (): LogLevel {
		return this.level;
	},

	flush: () =>
		Effect.tryPromise({
			try: async () => {
				// Flush logs to file via Tauri
				if (typeof TauriInvoke === 'function') {
					await TauriInvoke('mountain_log_flush', { 
						entries: this.logBuffer,
						timestamp: new Date().toISOString()
					});
					this.logBuffer = [];
					console.log('[LoggerService] Logs flushed to Mountain backend');
				} else {
					console.warn('[LoggerService] TauriInvoke not available, logs remain in memory');
				}
			},
			catch: (error) => {
				console.error('[LoggerService] Failed to flush logs:', error);
				return error;
			}
		}),

	shouldLog: function (level: LogLevel): boolean {
		const levels: LogLevel[] = ['trace', 'debug', 'info', 'warning', 'error', 'critical'];
		return levels.indexOf(level) >= levels.indexOf(this.level);
	},

	log: function (level: string, message: string, data?: Record<string, unknown>): void {
		const timestamp = new Date().toISOString();
		const logEntry = {
			timestamp,
			level,
			message,
			...data,
		};

		// Format for console
		const formattedMessage = `[${timestamp}][${level}] ${message}`;

		switch (level) {
			case 'TRACE':
			case 'DEBUG':
				console.debug(formattedMessage, data || '');
				break;
			case 'INFO':
				console.info(formattedMessage, data || '');
				break;
			case 'WARN':
				console.warn(formattedMessage, data || '');
				break;
			case 'ERROR':
			case 'CRITICAL':
				console.error(formattedMessage, data || '');
				break;
		}

		// Store log entries for file flushing
		this.logBuffer.push({
			timestamp: new Date().toISOString(),
			level,
			message,
			context: data || {}
		});
		
		// Auto-flush if buffer exceeds threshold
		if (this.logBuffer.length >= 100) {
			this.flush().pipe(Effect.runFork);
		}
	},
};

// Create logger context tag implementation
const LoggerServiceImplWithLayer = {
	service: LoggerServiceImpl,
	createLayer: () => Layer.succeed(LoggerServiceTag, LoggerServiceImpl),
};

/**
 * Configuration service implementation
 * Manages configuration with hierarchical access and defaults
 */
const ConfigurationServiceImpl = {
	config: new Map<string, unknown>(),
	changeHandlers: new Map<string, Set<(value: unknown) => void>>(),

	getValue: <T = unknown>(key: string, defaultValue?: T) =>
		Effect.sync(() => {
			const value = this.config.get(key);
			if (value === undefined) {
				return defaultValue;
			}
			return value as T;
		}),

	updateValue: <T>(key: string, value: T) =>
		Effect.tryPromise(async () => {
			const oldValue = this.config.get(key);
			this.config.set(key, value);

			// Notify listeners
			const handlers = this.changeHandlers.get(key);
			if (handlers) {
				handlers.forEach((handler) => handler(value));
			}

			// Sync with Mountain backend
			if (typeof TauriInvoke === 'function') {
				TauriInvoke('mountain_config_sync', { 
					key,
					value,
					timestamp: new Date().toISOString()
				}).then(() => {
					console.log('[ConfigurationService] Configuration synced with Mountain backend');
				}).catch(error => {
					console.error('[ConfigurationService] Failed to sync with Mountain:', error);
				});
			} else {
				console.warn('[ConfigurationService] TauriInvoke not available, config not synced');
			}

			return oldValue;
		}),

	getAll: () =>
		Effect.sync(() => {
			return Object.fromEntries(this.config);
		}),

	reset: () =>
		Effect.sync(() => {
			this.config.clear();
		}),

	onDidChange: (key: string, callback: (value: unknown) => void) =>
		Effect.sync(() => {
			if (!this.changeHandlers.has(key)) {
				this.changeHandlers.set(key, new Set());
			}
			this.changeHandlers.get(key)!.add(callback);

			// Return cleanup function
			return () => {
				const handlers = this.changeHandlers.get(key);
				if (handlers) {
					handlers.delete(callback);
				}
			};
		}),

	createLayer: () => Layer.succeed(ConfigurationServiceTag, ConfigurationServiceImpl),

	// Internal method to initialize with default configuration
	initialize: (initialConfig: Record<string, unknown>) =>
		Effect.sync(() => {
			Object.entries(initialConfig).forEach(([key, value]) => {
				ConfigurationServiceImpl.config.set(key, value);
			});
		})
};

const ConfigurationServiceImplWithLayer = {
	service: ConfigurationServiceImpl,
	createLayer: () => Layer.succeed(ConfigurationServiceTag, ConfigurationServiceImpl),
};

/**
 * File service implementation
 * Safe file operations with Tauri integration and error handling
 */
const FileServiceImpl = {
	readFile: (path: string) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { invoke } = await import('@tauri-apps/api/core');
						const content = await invoke('read_file', { path });
						return content;
					} catch (error) {
						console.warn(`[FileService] Failed to read file ${path}:`, error);
						throw error;
					}
				}
				throw new Error('File service not available (non-Tauri environment)');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to read file ${path}: ${error}`)),
		}),

	writeFile: (path: string, content: string) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { invoke } = await import('@tauri-apps/api/core');
						await invoke('write_file', { path, content });
						return undefined;
					} catch (error) {
						console.warn(`[FileService] Failed to write file ${path}:`, error);
						throw error;
					}
				}
				throw new Error('File service not available (non-Tauri environment)');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to write file ${path}: ${error}`)),
		}),

	exists: (path: string) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { invoke } = await import('@tauri-apps/api/core');
						const exists = await invoke('file_exists', { path });
						return exists;
					} catch (error) {
						console.warn(`[FileService] Failed to check file existence ${path}:`, error);
						return false;
					}
				}
				return false; // Default fallback
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to check file existence ${path}: ${error}`)),
		}),

	stat: (path: string) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { invoke } = await import('@tauri-apps/api/core');
						const stats = await invoke('file_stat', { path });
						return {
							isFile: stats.isFile,
							isDirectory: stats.isDirectory,
							size: stats.size,
							modified: stats.mtimeMs,
						};
					} catch (error) {
						console.warn(`[FileService] Failed to stat file ${path}:`, error);
						throw error;
					}
				}
				throw new Error('File service not available (non-Tauri environment)');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to stat file ${path}: ${error}`)),
		}),

	mkdir: (path: string) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { invoke } = await import('@tauri-apps/api/core');
						await invoke('create_directory', { path });
						return undefined;
					} catch (error) {
						console.warn(`[FileService] Failed to create directory ${path}:`, error);
						throw error;
					}
				}
				throw new Error('File service not available (non-Tauri environment)');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to create directory ${path}: ${error}`)),
		}),

	delete: (path: string) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { invoke } = await import('@tauri-apps/api/core');
						await invoke('delete_path', { path });
						return undefined;
					} catch (error) {
						console.warn(`[FileService] Failed to delete ${path}:`, error);
						throw error;
					}
				}
				throw new Error('File service not available (non-Tauri environment)');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to delete ${path}: ${error}`)),
		}),

	watch: (path: string, callback: () => void) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { invoke, listen } = await import('@tauri-apps/api/core');
						const watchId = await invoke('watch_path', { path });
						
						// Listen for file change events
						const unlisten = await listen(`file-changed-${watchId}`, (event) => {
							callback();
						});
						
						// Return cleanup function
						return () => {
							invoke('unwatch_path', { id: watchId });
							unlisten();
						};
					} catch (error) {
						console.warn(`[FileService] Failed to watch ${path}:`, error);
						throw error;
					}
				}
				throw new Error('File service not available (non-Tauri environment)');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to watch ${path}: ${error}`)),
		})
};

const FileServiceImplWithLayer = {
	service: FileServiceImpl,
	createLayer: () => Layer.succeed(FileServiceTag, FileServiceImpl),
};

/**
 * Dialog service implementation
 * Native OS dialogs using Tauri plugin-dialog
 */
const DialogInterfaceImpl = {
	showOpenDialog: (options: any) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { open } = await import('@tauri-apps/plugin-dialog');
						const selected = await open(options);
						return selected ? (Array.isArray(selected) ? selected : [selected]) : [];
					} catch (error) {
						console.warn('[DialogService] Failed to show open dialog:', error);
						return [];
					}
				}
				return [];
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to show open dialog: ${error}`)),
		}),

	showSaveDialog: (options: any) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { save } = await import('@tauri-apps/plugin-dialog');
						return await save(options);
					} catch (error) {
						console.warn('[DialogService] Failed to show save dialog:', error);
						return null;
					}
				}
				return null;
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to show save dialog: ${error}`)),
		}),

	showMessage: (options: any) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof window !== 'undefined' && (window as any).__TAURI__) {
					try {
						const { message } = await import('@tauri-apps/plugin-dialog');
						await message(options.message, {
							title: options.title,
							type: options.type || 'info'
						});
					} catch (error) {
						console.warn('[DialogService] Failed to show message dialog:', error);
						// Fallback to browser alert
						window.alert(`${options.title || ''}\n${options.message}`);
					}
				} else if (typeof window !== 'undefined') {
					window.alert(`${options.title || ''}\n${options.message}`);
				}
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to show message dialog: ${error}`)),
		})
};

const DialogInterfaceImplWithLayer = {
	service: DialogInterfaceImpl,
	createLayer: () => Layer.succeed(DialogServiceTag, DialogInterfaceImpl),
};

// ============================================================================
// EXPORTED FACTORY FUNCTIONS
// ============================================================================

/**
 * Create the environment service layer
 * @returns Effect-TS layer for EnvironmentService
 */
export const createEnvironmentServiceLayer = () => EnvironmentServiceImplWithLayer.createLayer();

/**
 * Create the logger service layer
 * @returns Effect-TS layer for LoggerService
 */
export const createLoggerServiceLayer = () => LoggerServiceImplWithLayer.createLayer();

/**
 * Create the configuration service layer
 * @param initialConfig - Optional initial configuration
 * @returns Effect-TS layer for ConfigurationService
 */
export const createConfigurationServiceLayer = (
	initialConfig?: Record<string, unknown>
) => {
	if (initialConfig) {
		ConfigurationServiceImpl.initialize(initialConfig);
	}
	return ConfigurationServiceImplWithLayer.createLayer();
};

/**
 * Create the file service layer
 * @returns Effect-TS layer for FileService
 */
export const createFileServiceLayer = () => FileServiceImplWithLayer.createLayer();

/**
 * Create the dialog service layer
 * @returns Effect-TS layer for DialogService
 */
export const createDialogServiceLayer = () => DialogInterfaceImplWithLayer.createLayer();

/**
 * Create the complete core services layer
 * Combines all core services into a single composable layer
 * @param initialConfig - Optional initial configuration
 * @returns Composed Effect-TS layer with all core services
 */
export const createCoreServicesLayer = (
	initialConfig?: Record<string, unknown>
) => {
	// Initialize configuration if provided
	if (initialConfig) {
		ConfigurationServiceImpl.initialize(initialConfig);
	}

	return Layer.mergeAll(
		EnvironmentServiceImplWithLayer.createLayer(),
		LoggerServiceImplWithLayer.createLayer(),
		ConfigurationServiceImplWithLayer.createLayer(),
		FileServiceImplWithLayer.createLayer(),
		DialogInterfaceImplWithLayer.createLayer()
	);
};

// ============================================================================
// TYPE EXPORTS (Extended for VSCode compatibility)
// ============================================================================

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
		wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
	};
	files?: {
		autoSave?: 'afterDelay' | 'onFocusChange' | 'onWindowChange' | 'off';
		autoSaveDelay?: number;
	};
	terminal?: {
		integrated?: {
			fontSize?: number;
			fontFamily?: string;
		};
	};
}

// ============================================================================
// DEFENSIVE SAFEGUARDS
// ============================================================================

/**
 * Validate service instance before use
 * @throws Error if service is invalid
 */
export function validateService<T>(
	service: T,
	serviceName: string
): asserts service is T {
	if (!service) {
		throw new Error(`Invalid service: ${serviceName} is null or undefined`);
	}

	// Type validation would go here
	// For now, basic existence check is sufficient
}

/**
 * Safe service accessor with error handling
 * Ensures services are available before use
 */
export function safeGetService<T extends Effect.TagClass<any, any>>(
	tag: T,
	errorMessage?: string
) {
	return Effect.gen(function* () {
		const service = yield* tag;

		validateService(service, tag.key);

		return service;
	});
}

// ============================================================================
// DEFAULT EXPORTS
// ============================================================================

export default {
	EnvironmentService: EnvironmentServiceTag,
	LoggerService: LoggerServiceTag,
	ConfigurationService: ConfigurationServiceTag,
	FileService: FileServiceTag,
	DialogService: DialogServiceTag,
	createCoreServicesLayer,
};
