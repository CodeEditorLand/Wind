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
export const EnvironmentServiceTag = Effect.Context.Tag<
	EnvironmentService,
	EnvironmentService
>('EnvironmentService');

/** Logger service context tag */
export const LoggerServiceTag = Effect.Context.Tag<LoggerService, LoggerService>(
	'LoggerService'
);

/** Configuration service context tag */
export const ConfigurationServiceTag = Effect.Context.Tag<
	ConfigurationService,
	ConfigurationService
>('ConfigurationService');

/** File service context tag */
export const FileServiceTag = Effect.Context.Tag<FileService, FileService>(
	'FileService'
);

/** Dialog service context tag */
export const DialogServiceTag = Effect.Context.Tag<
	DialogService,
	DialogService
>('DialogService');

// ============================================================================
// SERVICE IMPLEMENTATIONS
// ============================================================================

/**
 * Environment service implementation
 * Detects platform and runtime environment information
 */
const EnvironmentServiceImpl = EnvironmentServiceTag.of({
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
		Effect.sync(() => {
			// TODO: Integrate with Mountain backend to fetch environment variables
			// Mountain API: `mountain_fetch_env` command
			// For now, return undefined (handled by fallback or undefined return)
			if (typeof process !== 'undefined' && process.env) {
				return process.env[key] ?? fallback;
			}
			return fallback;
		}),

	isTauri: () =>
		Effect.sync(() => {
			return typeof (globalThis as any).__TAURI__ !== 'undefined';
		}),

	getOS: () =>
		Effect.sync(() => {
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

			// TODO: Fetch actual version from Mountain backend
			// Mountain API: `mountain_get_system_info` command
			return { platform, arch };
		}),

	createLayer: () => EnvironmentServiceTag.default(EnvironmentServiceImpl),
});

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
		Effect.sync(() => {
			// TODO: Flush logs to file via Tauri
			// Tauri API: `writeFile` in persistent storage
			// For now, logs are in memory only
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

		// TODO: Store log entries for file flushing
		// Store in memory buffer or send to backend
	},
};

// Create logger context tag implementation
const LoggerServiceImplWithLayer = {
	service: LoggerServiceImpl,
	createLayer: () => LoggerServiceTag.default(LoggerServiceImpl),
};

/**
 * Configuration service implementation
 * Manages configuration with hierarchical access and defaults
 */
const ConfigurationServiceImpl = ConfigurationServiceTag.of({
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
		Effect.sync(() => {
			const oldValue = this.config.get(key);
			this.config.set(key, value);

			// Notify listeners
			const handlers = this.changeHandlers.get(key);
			if (handlers) {
				handlers.forEach((handler) => handler(value));
			}

			// TODO: Sync with Mountain backend
			// Mountain API: `mountain_update_configuration` command
			// Also need to handle conflict resolution with MountainWindSync
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

	createLayer: () => ConfigurationServiceTag.default(ConfigurationServiceImpl),

	// Internal method to initialize with default configuration
	initialize: (initialConfig: Record<string, unknown>) =>
		Effect.sync(() => {
			Object.entries(initialConfig).forEach(([key, value]) => {
				ConfigurationServiceImpl.config.set(key, value);
			});
		}),
});

/**
 * File service implementation
 * Safe file operations with Tauri integration and error handling
 */
const FileServiceImpl = FileServiceTag.of({
	readFile: (path: string) =>
		Effect.tryPromise({
			try: async () => {
				// TODO: Implement Tauri file reading
				// Import from @tauri-apps/plugin-fs or @tauri-apps/api/fs
				// const { readTextFile } = await import('@tauri-apps/plugin-fs');
				// return await readTextFile(path);

				// Temporary stub for defensive implementation
				throw new Error('File service not yet connected to Tauri APIs');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to read file ${path}: ${error}`)),
		}),

	writeFile: (path: string, content: string) =>
		Effect.tryPromise({
			try: async () => {
				// TODO: Implement Tauri file writing
				// const { writeTextFile } = await import('@tauri-apps/plugin-fs');
				// await writeTextFile(path, content);

				throw new Error('File service not yet connected to Tauri APIs');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to write file ${path}: ${error}`)),
		}),

	exists: (path: string) =>
		Effect.tryPromise({
			try: async () => {
				// TODO: Implement Tauri exists check
				// const { exists } = await import('@tauri-apps/plugin-fs');
				// return await exists(path);

				return false; // Default fallback
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to check file existence ${path}: ${error}`)),
		}),

	stat: (path: string) =>
		Effect.tryPromise({
			try: async () => {
				// TODO: Implement Tauri stat
				// const { stat } = await import('@tauri-apps/plugin-fs');
				// const stats = await stat(path);
				// return {
				//     isFile: stats.isFile,
				//     isDirectory: stats.isDirectory,
				//     size: stats.size,
				//     modified: stats.mtimeMs,
				// };

				throw new Error('File service not yet connected to Tauri APIs');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to stat file ${path}: ${error}`)),
		}),

	mkdir: (path: string) =>
		Effect.tryPromise({
			try: async () => {
				// TODO: Implement Tauri mkdir
				// const { mkdir } = await import('@tauri-apps/plugin-fs');
				// await mkdir(path, { recursive: true });

				throw new Error('File service not yet connected to Tauri APIs');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to create directory ${path}: ${error}`)),
		}),

	delete: (path: string) =>
		Effect.tryPromise({
			try: async () => {
				// TODO: Implement Tauri delete
				// const { remove } = await import('@tauri-apps/plugin-fs');
				// await remove(path, { recursive: true });

				throw new Error('File service not yet connected to Tauri APIs');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to delete ${path}: ${error}`)),
		}),

	watch: (path: string, callback: () => void) =>
		Effect.tryPromise({
			try: async () => {
				// TODO: Implement Tauri watch
				// This typically uses a command-based approach:
				// await invoke('watch_path', { path });
				// Listen to `tauri://file-changed` events

				throw new Error('File watch not yet connected to Tauri APIs');
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to watch ${path}: ${error}`)),
		}),

	createLayer: () => FileServiceTag.default(FileServiceImpl),
});

/**
 * Dialog service implementation
 * Native OS dialogs using Tauri plugin-dialog
 */
const DialogInterfaceImpl = DialogServiceTag.of({
	showOpenDialog: (options: any) =>
		Effect.tryPromise({
			try: async () => {
				// TODO: Implement Tauri dialog
				// Import from @tauri-apps/plugin-dialog
				// const { open } = await import('@tauri-apps/plugin-dialog');
				// const selected = await open(options);
				// return selected ? (Array.isArray(selected) ? selected : [selected]) : [];

				// Temporary stub
				return [];
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to show open dialog: ${error}`)),
		}),

	showSaveDialog: (options: any) =>
		Effect.tryPromise({
			try: async () => {
				// TODO: Implement Tauri save dialog
				// const { save } = await import('@tauri-apps/plugin-dialog');
				// return await save(options);

				return null;
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to show save dialog: ${error}`)),
		}),

	showMessage: (options: any) =>
		Effect.tryPromise({
			try: async () => {
				// TODO: Implement Tauri message dialog
				// const { message } = await import('@tauri-apps/plugin-dialog');
				// await message(options.message, options.title, options.type);

				// Fallback to browser alert
				if (typeof window !== 'undefined') {
					window.alert(`${options.title || ''}\n${options.message}`);
				}
			},
			catch: (error) =>
				Effect.fail(new Error(`Failed to show message dialog: ${error}`)),
		}),

	createLayer: () => DialogServiceTag.default(DialogInterfaceImpl),
});

// ============================================================================
// EXPORTED FACTORY FUNCTIONS
// ============================================================================

/**
 * Create the environment service layer
 * @returns Effect-TS layer for EnvironmentService
 */
export const createEnvironmentServiceLayer = () => EnvironmentServiceImpl;

/**
 * Create the logger service layer
 * @returns Effect-TS layer for LoggerService
 */
export const createLoggerServiceLayer = () => LoggerServiceImplWithLayer;

/**
 * Create the configuration service layer
 * @param initialConfig - Optional initial configuration
 * @returns Effect-TS layer for ConfigurationService
 */
export const createConfigurationServiceLayer = (
	initialConfig?: Record<string, unknown>
) => ConfigurationServiceImpl;

/**
 * Create the file service layer
 * @returns Effect-TS layer for FileService
 */
export const createFileServiceLayer = () => FileServiceImpl;

/**
 * Create the dialog service layer
 * @returns Effect-TS layer for DialogService
 */
export const createDialogServiceLayer = () => DialogInterfaceImpl;

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

	return Effect.Layer.mergeAll(
		EnvironmentServiceImpl,
		LoggerServiceImplWithLayer.createLayer(),
		ConfigurationServiceImpl.createLayer(),
		FileServiceImpl.createLayer(),
		DialogInterfaceImpl.createLayer()
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
export function safe getService<T extends Effect.TagClass<any, any>>(
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
