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

// ============================================================================
// TYPES
// ============================================================================

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
	getValue: <T = ConfigValue>(
		key: string,
		defaultValue?: T
	) => Effect.Effect<T | undefined>;

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
	onDidChange: (
		key: string,
		callback: ConfigChangeHandler
	) => Effect.Effect<() => void>;

	/**
	 * Get configuration section (VSCode pattern)
	 * @param sectionId - Section identifier (e.g., 'editor')
	 * @returns Effect that resolves to section configuration
	 */
	getConfiguration: <T = Record<string, unknown>>(
		sectionId: string
	) => Effect.Effect<T | undefined>;

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

// ============================================================================
// CONTEXT TAG
// ============================================================================

export const ConfigurationServiceTag = Effect.Tag<
	ConfigurationService,
	ConfigurationService
>('ConfigurationService');

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get nested object value by dot notation key
 */
function getNestedValue(obj: Record<string, unknown>, key: string): unknown {
	return key.split('.').reduce((current: unknown, prop: string) => {
		if (current && typeof current === 'object' && prop in current) {
			return (current as Record<string, unknown>)[prop];
		}
		return undefined;
	}, obj);
}

/**
 * Set nested object value by dot notation key
 */
function setNestedValue(
	obj: Record<string, unknown>,
	key: string,
	value: unknown
): void {
	const keys = key.split('.');
	const lastKey = keys.pop()!;

	let current: Record<string, unknown> = obj;

	for (const prop of keys) {
		if (!(prop in current) || typeof current[prop] !== 'object' || current[prop] === null) {
			current[prop] = {};
		}
		current = current[prop] as Record<string, unknown>;
	}

	current[lastKey] = value;
}

/**
 * Flatten nested object to dot notation keys
 */
function flattenObject(
	obj: Record<string, unknown>,
	prefix: string = ''
): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const key in obj) {
		const value = obj[key];
		const newKey = prefix ? `${prefix}.${key}` : key;

		if (value && typeof value === 'object' && !Array.isArray(value)) {
			Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
		} else {
			result[newKey] = value;
		}
	}

	return result;
}

/**
 * Unflatten dot notation keys to nested object
 */
function unflattenObject(flat: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const key in flat) {
		setNestedValue(result, key, flat[key]);
	}

	return result;
}

/**
 * Sync configuration to Mountain via Tauri
 */
async function syncToMountain(key: string, value: unknown): Promise<void> {
	if (typeof (globalThis as any).__TAURI__ !== 'undefined') {
		try {
			const { invoke } = (globalThis as any).__TAURI__.core;
			await invoke('mountain_update_configuration', { key, value });
		} catch (error) {
			// Silently ignore sync errors
			console.warn(`[ConfigurationService] Failed to sync to Mountain: ${error}`);
		}
	}
}

/**
 * Validate configuration against schema (basic implementation)
 */
function validateConfiguration(
	config: Record<string, unknown>,
	schema: Record<string, unknown> | undefined
): boolean {
	if (!schema) {
		return true;
	}

	// Basic validation - full schema validation would use a validation library
	for (const key in schema) {
		const value = getNestedValue(config, key);
		const schemaValue = schema[key];

		if (typeof schemaValue === 'type') {
			if (value === undefined || typeof value !== schemaValue) {
				return false;
			}
		}
	}

	return true;
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

class ConfigurationServiceImpl implements ConfigurationService {
	private config: Map<string, unknown>;
	private changeHandlers: Map<string, Set<ConfigChangeHandler>>;
	private enableMountainSync: boolean;
	private enablePersistence: boolean;
	private schema?: Record<string, unknown>;

	constructor(options: ConfigurationServiceOptions = {}) {
		this.config = new Map();
		this.changeHandlers = new Map();
		this.enableMountainSync = options.enableMountainSync || false;
		this.enablePersistence = options.enablePersistence || false;
		this.schema = options.schema;

		// Initialize with provided config
		if (options.initialConfig) {
			this.initialize(options.initialConfig);
		}
	}

	getValue: <T = ConfigValue>(
		key: string,
		defaultValue?: T
	) => Effect.Effect<T | undefined> = (key, defaultValue) => {
		return Effect.sync(() => {
			const value = this.config.get(key);
			if (value === undefined) {
				return defaultValue;
			}
			return value as T | undefined;
		});
	};

	updateValue: <T>(key: string, value: T) => Effect.Effect<void> = (key, value) => {
		return Effect.sync(() => {
			const oldValue = this.config.get(key);
			this.config.set(key, value);

			// Validate configuration
			const configObj = unflattenObject(Object.fromEntries(this.config));
			if (!validateConfiguration(configObj, this.schema)) {
				// Revert if validation fails
				if (oldValue !== undefined) {
					this.config.set(key, oldValue);
				} else {
					this.config.delete(key);
				}
				throw new Error(`Configuration validation failed for key: ${key}`);
			}

			// Notify listeners
			const handlers = this.changeHandlers.get(key);
			if (handlers) {
				handlers.forEach((handler) => {
					try {
						handler(value);
					} catch (error) {
						console.warn(`[ConfigurationService] Handler error: ${error}`);
					}
				});
			}

			// Sync to Mountain if enabled
			if (this.enableMountainSync) {
				syncToMountain(key, value).catch(() => {
					// Silently ignore sync errors
				});
			}

			// Persist if enabled
			if (this.enablePersistence) {
				this.persist().catch(() => {
					// Silently ignore persistence errors
				});
			}
		});
	};

	getAll: () => Effect.Effect<Record<string, unknown>> = () => {
		return Effect.sync(() => {
			return Object.fromEntries(this.config);
		});
	};

	reset: () => Effect.Effect<void> = () => {
		return Effect.sync(() => {
			this.config.clear();

			// Notify all handlers
			this.changeHandlers.forEach((handlers) => {
				handlers.forEach((handler) => {
					try {
						handler(undefined);
					} catch (error) {
						console.warn(`[ConfigurationService] Handler error: ${error}`);
					}
				});
			});
		});
	};

	onDidChange: (
		key: string,
		callback: ConfigChangeHandler
	) => Effect.Effect<() => void> = (key, callback) => {
		return Effect.sync(() => {
			if (!this.changeHandlers.has(key)) {
				this.changeHandlers.set(key, new Set());
			}
			this.changeHandlers.get(key)!.add(callback);

			// Return cleanup function
			return () => {
				const handlers = this.changeHandlers.get(key);
				if (handlers) {
					handlers.delete(callback);
					if (handlers.size === 0) {
						this.changeHandlers.delete(key);
					}
				}
			};
		});
	};

	getConfiguration: <T = Record<string, unknown>>(
		sectionId: string
	) => Effect.Effect<T | undefined> = (sectionId) => {
		return Effect.sync(() => {
			// Find all keys that start with sectionId
			const sectionConfig: Record<string, unknown> = {};
			const prefix = `${sectionId}.`;

			for (const [key, value] of this.config.entries()) {
				if (key === sectionId) {
					// Direct section value
					return value as T | undefined;
				}
				if (key.startsWith(prefix)) {
					const subKey = key.substring(prefix.length);
					sectionConfig[subKey] = value;
				}
			}

			// If we have sub-keys, return as object
			if (Object.keys(sectionConfig).length > 0) {
				return unflattenObject(sectionConfig) as T | undefined;
			}

			return undefined;
		});
	};

	setMany: (values: Record<string, unknown>) => Effect.Effect<void> = (values) => {
		return Effect.sync(() => {
			const flattened = flattenObject(values);

			for (const [key, value] of Object.entries(flattened)) {
				this.config.set(key, value);
			}
		});
	};

	/**
	 * Initialize with configuration object
	 */
	private initialize(config: Record<string, unknown>): void {
		const flattened = flattenObject(config);
		for (const [key, value] of Object.entries(flattened)) {
			this.config.set(key, value);
		}
	}

	/**
	 * Persist configuration to storage
	 */
	private async persist(): Promise<void> {
		if (typeof (globalThis as any).__TAURI__ !== 'undefined') {
			try {
				const { writeTextFile, mkdir } = await import('@tauri-apps/plugin-fs');
				const configDir = 'config';

				await mkdir(configDir, { recursive: true });

				const configStr = JSON.stringify(Object.fromEntries(this.config), null, 2);
				await writeTextFile(`${configDir}/wind-config.json`, configStr);
			} catch (error) {
				console.warn(`[ConfigurationService] Failed to persist config: ${error}`);
			}
		}
	}

	/**
	 * Load configuration from storage
	 */
	async load(): Promise<void> {
		if (typeof (globalThis as any).__TAURI__ !== 'undefined') {
			try {
				const { readTextFile, exists } = await import('@tauri-apps/plugin-fs');
				const configPath = 'config/wind-config.json';

				const configExists = await exists(configPath);
				if (configExists) {
					const configStr = await readTextFile(configPath);
					const configObj = JSON.parse(configStr);
					this.initialize(configObj);
				}
			} catch (error) {
				console.warn(`[ConfigurationService] Failed to load config: ${error}`);
			}
		}
	}
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create the configuration service layer
 * @param options - Configuration service options
 * @returns Effect-TS layer for ConfigurationService
 */
export function createConfigurationServiceLayer(
	options?: ConfigurationServiceOptions
): Effect.Layer<never> {
	const configurationService = new ConfigurationServiceImpl(options);
	return ConfigurationServiceTag.provide(configurationService);
}

// ============================================================================
// EFFECT-TS WRAPPERS
// ============================================================================

/**
 * Effect wrapper for getting configuration value
 */
export function getValueEffect<T = ConfigValue>(
	key: string,
	defaultValue?: T
): Effect.Effect<T | undefined> {
	return Effect.flatMap(
		ConfigurationServiceTag,
		(service) => service.getValue<T>(key, defaultValue)
	);
}

/**
 * Effect wrapper for updating configuration value
 */
export function updateValueEffect<T>(key: string, value: T): Effect.Effect<void> {
	return Effect.flatMap(
		ConfigurationServiceTag,
		(service) => service.updateValue<T>(key, value)
	);
}

/**
 * Effect wrapper for getting configuration section
 */
export function getConfigurationEffect<T = Record<string, unknown>>(
	sectionId: string
): Effect.Effect<T | undefined> {
	return Effect.flatMap(
		ConfigurationServiceTag,
		(service) => service.getConfiguration<T>(sectionId)
	);
}

/**
 * Effect wrapper for watching configuration changes
 */
export function onDidChangeEffect(
	key: string,
	callback: ConfigChangeHandler
): Effect.Effect<() => void> {
	return Effect.flatMap(
		ConfigurationServiceTag,
		(service) => service.onDidChange(key, callback)
	);
}

/**
 * Effect wrapper for resetting configuration value
 */
export function resetEffect(key: string): Effect.Effect<void> {
	return Effect.flatMap(
		ConfigurationServiceTag,
		(service) => service.reset(key)
	);
}

/**
 * Effect wrapper for setting multiple configuration values
 */
export function setManyEffect(values: Record<string, unknown>): Effect.Effect<void> {
	return Effect.flatMap(
		ConfigurationServiceTag,
		(service) => service.setMany(values)
	);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { ConfigurationService, ConfigValue, ConfigChangeHandler, ConfigurationServiceOptions };
export default ConfigurationServiceTag;
