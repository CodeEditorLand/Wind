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

import { invoke } from "@tauri-apps/api/core";

/**
 * Configuration scope
 */
export enum ConfigurationScope {
	APPLICATION = 1,
	WORKSPACE = 2,
	PROFILE = 3,
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
	updateValue(
		key: string,
		value: any,
		scope?: ConfigurationScope,
	): Promise<void>;
	onDidChangeConfiguration: Event<IConfigurationChangeEvent>;
	inspect<T>(
		key: string,
		scope?: ConfigurationScope,
	): { value?: T; defaultValue?: T };
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
 * Configuration change event emitter
 */
class ConfigurationChangeEvent implements IConfigurationChangeEvent {
	constructor(public changedConfiguration: Set<string>) {}

	affectsConfiguration(section: string): boolean {
		for (const changed of this.changedConfiguration) {
			if (changed === section || changed.startsWith(section + ".")) {
				return true;
			}
		}
		return false;
	}
}

/**
 * Event emitter for configuration changes
 */
class EventEmitter<T> {
	private listeners: Set<(value: T) => void> = new Set();

	on(listener: (value: T) => void): void {
		this.listeners.add(listener);
	}

	off(listener: (value: T) => void): void {
		this.listeners.delete(listener);
	}

	emit(value: T): void {
		this.listeners.forEach((listener) => {
			try {
				listener(value);
			} catch (error) {
				console.error(
					"[ConfigurationService] Error in event listener:",
					error,
				);
			}
		});
	}
}

/**
 * Tauri Configuration Service implementation
 */
export class TauriConfigurationService implements IConfigurationService {
	private configuration: Map<ConfigurationScope, IConfigurationData> =
		new Map();
	private changeEventEmitter = new EventEmitter<IConfigurationChangeEvent>();
	private isInitialized = false;

	constructor() {
		console.log(
			"[TauriConfigurationService] Initializing configuration service",
		);
		this.initialize();
	}

	/**
	 * Initialize configuration service
	 */
	private async initialize(): Promise<void> {
		try {
			// Load configuration from Tauri backend
			await this.loadConfiguration();
			this.isInitialized = true;
			console.log(
				"[TauriConfigurationService] Configuration service initialized",
			);
		} catch (error) {
			console.error(
				"[TauriConfigurationService] Failed to initialize:",
				error,
			);
			// Initialize with empty configuration
			this.configuration.set(ConfigurationScope.APPLICATION, {});
			this.configuration.set(ConfigurationScope.WORKSPACE, {});
			this.configuration.set(ConfigurationScope.PROFILE, {});
			this.isInitialized = true;
		}
	}

	/**
	 * Load configuration from Tauri backend
	 */
	private async loadConfiguration(): Promise<void> {
		try {
			const configData = await invoke<Record<string, IConfigurationData>>(
				"get_configuration_data",
			);

			if (configData.application) {
				this.configuration.set(
					ConfigurationScope.APPLICATION,
					configData.application,
				);
			}
			if (configData.workspace) {
				this.configuration.set(
					ConfigurationScope.WORKSPACE,
					configData.workspace,
				);
			}
			if (configData.profile) {
				this.configuration.set(
					ConfigurationScope.PROFILE,
					configData.profile,
				);
			}

			console.log(
				"[TauriConfigurationService] Configuration loaded successfully",
			);
		} catch (error) {
			console.error(
				"[TauriConfigurationService] Failed to load configuration:",
				error,
			);

			// Initialize with default configuration if loading fails
			this.configuration.set(ConfigurationScope.APPLICATION, {
				_version: 1,
				_timestamp: Date.now(),
				window: {
					zoomLevel: 0,
					theme: "dark",
				},
				editor: {
					fontSize: 14,
					lineNumbers: "on",
				},
			});
			this.configuration.set(ConfigurationScope.WORKSPACE, {
				_version: 1,
				_timestamp: Date.now(),
			});
			this.configuration.set(ConfigurationScope.PROFILE, {
				_version: 1,
				_timestamp: Date.now(),
			});

			console.log(
				"[TauriConfigurationService] Initialized with default configuration",
			);
		}
	}

	/**
	 * Save configuration to Tauri backend
	 */
	private async saveConfiguration(): Promise<void> {
		if (!this.isInitialized) {
			console.warn(
				"[TauriConfigurationService] Configuration service not initialized",
			);
			return;
		}

		try {
			const configData = {
				application:
					this.configuration.get(ConfigurationScope.APPLICATION) ||
					{},
				workspace:
					this.configuration.get(ConfigurationScope.WORKSPACE) || {},
				profile:
					this.configuration.get(ConfigurationScope.PROFILE) || {},
			};

			await invoke("save_configuration_data", { configData });
			console.log(
				"[TauriConfigurationService] Configuration saved successfully",
			);
		} catch (error) {
			console.error(
				"[TauriConfigurationService] Failed to save configuration:",
				error,
			);

			// Implement conflict resolution: retry with exponential backoff
			await this.handleConfigurationConflict(error);
		}
	}

	/**
	 * Handle configuration conflicts with retry logic
	 */
	private async handleConfigurationConflict(error: any): Promise<void> {
		console.warn(
			"[TauriConfigurationService] Configuration conflict detected, implementing retry logic",
		);

		const maxRetries = 3;
		const baseDelay = 100; // ms

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			const delay = baseDelay * Math.pow(2, attempt - 1);
			console.log(
				`[TauriConfigurationService] Retry attempt ${attempt}/${maxRetries} after ${delay}ms`,
			);

			await new Promise((resolve) => setTimeout(resolve, delay));

			try {
				// Reload configuration first to get latest state
				await this.loadConfiguration();

				// Retry saving
				const configData = {
					application:
						this.configuration.get(
							ConfigurationScope.APPLICATION,
						) || {},
					workspace:
						this.configuration.get(ConfigurationScope.WORKSPACE) ||
						{},
					profile:
						this.configuration.get(ConfigurationScope.PROFILE) ||
						{},
				};

				await invoke("save_configuration_data", { configData });
				console.log(
					"[TauriConfigurationService] Configuration saved successfully after retry",
				);
				return;
			} catch (retryError) {
				console.error(
					`[TauriConfigurationService] Retry attempt ${attempt} failed:`,
					retryError,
				);

				if (attempt === maxRetries) {
					console.error(
						"[TauriConfigurationService] All retry attempts failed, configuration may be out of sync",
					);
					throw new Error(
						`Configuration synchronization failed after ${maxRetries} attempts: ${retryError}`,
					);
				}
			}
		}
	}

	/**
	 * Get configuration value
	 */
	getValue<T>(
		key: string,
		defaultValue?: T,
		scope: ConfigurationScope = ConfigurationScope.APPLICATION,
	): T {
		if (!this.isInitialized) {
			console.warn(
				"[TauriConfigurationService] Configuration service not initialized",
			);
			return defaultValue as T;
		}

		const scopeConfig = this.configuration.get(scope);
		if (!scopeConfig) {
			return defaultValue as T;
		}

		const value = this.getNestedValue(scopeConfig, key);
		return value !== undefined ? value : (defaultValue as T);
	}

	/**
	 * Get nested value from configuration object
	 */
	private getNestedValue(obj: any, key: string): any {
		const keys = key.split(".");
		let current = obj;

		for (const k of keys) {
			if (current && typeof current === "object" && k in current) {
				current = current[k];
			} else {
				return undefined;
			}
		}

		return current;
	}

	/**
	 * Set nested value in configuration object
	 */
	private setNestedValue(obj: any, key: string, value: any): void {
		const keys = key.split(".");
		let current = obj;

		for (let i = 0; i < keys.length - 1; i++) {
			const k = keys[i];
			if (!(k in current) || typeof current[k] !== "object") {
				current[k] = {};
			}
			current = current[k];
		}

		current[keys[keys.length - 1]] = value;
	}

	/**
	 * Update configuration value
	 */
	async updateValue(
		key: string,
		value: any,
		scope: ConfigurationScope = ConfigurationScope.APPLICATION,
	): Promise<void> {
		if (!this.isInitialized) {
			console.warn(
				"[TauriConfigurationService] Configuration service not initialized",
			);
			return;
		}

		// Validate configuration key and value
		if (!this.validateConfigurationKey(key)) {
			throw new Error(`Invalid configuration key: ${key}`);
		}

		if (!this.validateConfigurationValue(key, value)) {
			throw new Error(
				`Invalid configuration value for key ${key}: ${value}`,
			);
		}

		let scopeConfig = this.configuration.get(scope);
		if (!scopeConfig) {
			scopeConfig = {};
			this.configuration.set(scope, scopeConfig);
		}

		const oldValue = this.getNestedValue(scopeConfig, key);

		if (oldValue !== value) {
			this.setNestedValue(scopeConfig, key, value);

			// Update timestamp and version
			scopeConfig._timestamp = Date.now();
			scopeConfig._version = (scopeConfig._version || 0) + 1;

			// Save configuration
			await this.saveConfiguration();

			// Emit change event
			const changedConfiguration = new Set<string>([key]);
			const changeEvent = new ConfigurationChangeEvent(
				changedConfiguration,
			);
			this.changeEventEmitter.emit(changeEvent);

			console.log(
				`[TauriConfigurationService] Configuration updated: ${key} = ${value}`,
			);
		}
	}

	/**
	 * Validate configuration key
	 */
	private validateConfigurationKey(key: string): boolean {
		// Key must be non-empty and follow naming conventions
		if (!key || key.trim().length === 0) {
			return false;
		}

		// Key must not contain invalid characters
		const invalidChars = /[^a-zA-Z0-9._-]/;
		if (invalidChars.test(key)) {
			return false;
		}

		// Key must not start or end with dots
		if (key.startsWith(".") || key.endsWith(".")) {
			return false;
		}

		// Key must not contain consecutive dots
		if (key.includes("..")) {
			return false;
		}

		return true;
	}

	/**
	 * Validate configuration value
	 */
	private validateConfigurationValue(key: string, value: any): boolean {
		// Basic validation: value must not be undefined
		if (value === undefined) {
			return false;
		}

		// Type-specific validation based on key patterns
		if (key.includes("zoomLevel") || key.includes("fontSize")) {
			// Numeric values must be valid numbers
			if (typeof value !== "number" || !isFinite(value)) {
				return false;
			}

			// Range validation
			if (key.includes("zoomLevel")) {
				return value >= -8 && value <= 9; // Standard zoom level range
			}
			if (key.includes("fontSize")) {
				return value >= 6 && value <= 100; // Reasonable font size range
			}
		}

		// Boolean values must be actual booleans
		if (
			key.includes("enable") ||
			key.includes("show") ||
			key.includes("visible")
		) {
			return typeof value === "boolean";
		}

		// String values must be non-empty strings
		if (typeof value === "string") {
			return value.trim().length > 0;
		}

		return true;
	}

	/**
	 * Validate entire configuration scope
	 */
	validateScopeConfiguration(scope: ConfigurationScope): boolean {
		const scopeConfig = this.configuration.get(scope);
		if (!scopeConfig) {
			return true; // Empty scope is valid
		}

		// Validate all keys and values in the scope
		const keys: string[] = [];
		this.collectKeys(scopeConfig, "", keys);

		for (const key of keys) {
			const value = this.getNestedValue(scopeConfig, key);
			if (
				!this.validateConfigurationKey(key) ||
				!this.validateConfigurationValue(key, value)
			) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Event emitter for configuration changes
	 */
	get onDidChangeConfiguration(): Event<IConfigurationChangeEvent> {
		return {
			addListener: (
				listener: (event: IConfigurationChangeEvent) => void,
			) => {
				this.changeEventEmitter.on(listener);
			},
			removeListener: (
				listener: (event: IConfigurationChangeEvent) => void,
			) => {
				this.changeEventEmitter.off(listener);
			},
		} as Event<IConfigurationChangeEvent>;
	}

	/**
	 * Inspect configuration value
	 */
	inspect<T>(
		key: string,
		scope: ConfigurationScope = ConfigurationScope.APPLICATION,
	): { value?: T; defaultValue?: T } {
		if (!this.isInitialized) {
			console.warn(
				"[TauriConfigurationService] Configuration service not initialized",
			);
			return {};
		}

		const scopeConfig = this.configuration.get(scope);
		if (!scopeConfig) {
			return {};
		}

		const value = this.getNestedValue(scopeConfig, key);
		return { value };
	}

	/**
	 * Get all configuration keys
	 */
	keys(): string[] {
		if (!this.isInitialized) {
			console.warn(
				"[TauriConfigurationService] Configuration service not initialized",
			);
			return [];
		}

		const keys: string[] = [];

		for (const [scope, config] of this.configuration) {
			this.collectKeys(config, "", keys);
		}

		return Array.from(new Set(keys)); // Remove duplicates
	}

	/**
	 * Recursively collect configuration keys
	 */
	private collectKeys(obj: any, prefix: string, keys: string[]): void {
		for (const key in obj) {
			if (key.startsWith("_")) continue; // Skip metadata keys

			const fullKey = prefix ? `${prefix}.${key}` : key;

			if (typeof obj[key] === "object" && obj[key] !== null) {
				this.collectKeys(obj[key], fullKey, keys);
			} else {
				keys.push(fullKey);
			}
		}
	}

	/**
	 * Reload configuration
	 */
	async reloadConfiguration(): Promise<void> {
		console.log("[TauriConfigurationService] Reloading configuration");

		try {
			await this.loadConfiguration();

			// Emit change event for all keys
			const allKeys = this.keys();
			const changedConfiguration = new Set<string>(allKeys);
			const changeEvent = new ConfigurationChangeEvent(
				changedConfiguration,
			);
			this.changeEventEmitter.emit(changeEvent);

			console.log(
				"[TauriConfigurationService] Configuration reloaded successfully",
			);
		} catch (error) {
			console.error(
				"[TauriConfigurationService] Failed to reload configuration:",
				error,
			);
			throw error;
		}
	}

	/**
	 * Get configuration scope data
	 */
	getScopeData(scope: ConfigurationScope): IConfigurationData | undefined {
		return this.configuration.get(scope);
	}

	/**
	 * Set configuration scope data
	 */
	async setScopeData(
		scope: ConfigurationScope,
		data: IConfigurationData,
	): Promise<void> {
		this.configuration.set(scope, data);
		await this.saveConfiguration();

		// Emit change event for all keys in this scope
		const keys: string[] = [];
		this.collectKeys(data, "", keys);
		const changedConfiguration = new Set<string>(keys);
		const changeEvent = new ConfigurationChangeEvent(changedConfiguration);
		this.changeEventEmitter.emit(changeEvent);
	}

	/**
	 * Check if configuration service is ready
	 */
	isReady(): boolean {
		return this.isInitialized;
	}

	/**
	 * Dispose configuration service
	 */
	dispose(): void {
		this.configuration.clear();
		this.isInitialized = false;
		console.log("[TauriConfigurationService] Disposed");
	}
}

// Export singleton instance
export const tauriConfigurationService = new TauriConfigurationService();
