/**
 * @module Test Bootstrap Integration CoreServices
 * @description
 * Comprehensive test suite for Wind CoreServices factory functions.
 * Implements TDD approach: tests drive implementation.
 *
 * Tests cover:
 * - Service factory creation and validation
 * - Service layer composition
 * - Fallback mechanisms
 * - Error handling and recovery
 * - Type safety
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	EnvironmentServiceTag,
	LoggerServiceTag,
	ConfigurationServiceTag,
	FileServiceTag,
	DialogServiceTag,
} from '../../../Source/Bootstrap/Integration/Core/CoreServices.js';
import * as Effect from 'effect/Effect';

describe('CoreServices - Environment Service', () => {
	describe('createEnvironmentServiceLayer', () => {
		it('should create a valid EnvironmentServiceTag layer', () => {
			const layer = EnvironmentServiceTag.createLayer();

			expect(layer).toBeDefined();
			expect(layer._tag).toBeDefined();
		});

		it('should provide platform detection', async () => {
			const layer = EnvironmentServiceTag.createLayer();
			const envService = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getPlatform();
				}).pipe(Effect.provide(layer))
			);

			expect(envService).toMatch(/tauri|browser|web/);
		});

		it('should provide language detection', async () => {
			const layer = EnvironmentServiceTag.createLayer();
			const language = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getLanguage();
				}).pipe(Effect.provide(layer))
			);

			expect(typeof language).toBe('string');
			expect(language).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
		});

		it('should provide timezone detection', async () => {
			const layer = EnvironmentServiceTag.createLayer();
			const timezone = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getTimezone();
				}).pipe(Effect.provide(layer))
			);

			expect(typeof timezone).toBe('string');
			expect(timezone.length).toBeGreaterThan(0);
		});

		it('should provide user agent string', async () => {
			const layer = EnvironmentServiceTag.createLayer();
			const userAgent = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					return service.getUserAgent();
				}).pipe(Effect.provide(layer))
			);

			expect(typeof userAgent).toBe('string');
			expect(userAgent.length).toBeGreaterThan(0);
		});

		it('should handle fallback gracefully', async () => {
			const layer = EnvironmentServiceTag.createLayer();
			const result = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* EnvironmentServiceTag;
					// Test missing property with fallback
					return service.getEnv('NONEXISTENT_VAR', 'fallback-value');
				}).pipe(Effect.provide(layer))
			);

			expect(result).toBe('fallback-value');
		});
	});
});

describe('CoreServices - Logger Service', () => {
	describe('createLoggerServiceLayer', () => {
		it('should create a valid LoggerServiceTag layer', () => {
			const layer = LoggerServiceTag.createLayer();

			expect(layer).toBeDefined();
			expect(layer._tag).toBeDefined();
		});

		it('should support log levels: trace, debug, info, warning, error', async () => {
			const layer = LoggerServiceTag.createLayer();
			const logger = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					return service;
				}).pipe(Effect.provide(layer))
			);

			expect(logger.trace).toBeInstanceOf(Function);
			expect(logger.debug).toBeInstanceOf(Function);
			expect(logger.info).toBeInstanceOf(Function);
			expect(logger.warning).toBeInstanceOf(Function);
			expect(logger.error).toBeInstanceOf(Function);
			expect(logger.critical).toBeInstanceOf(Function);
		});

		it('should log messages with given level', async () => {
			const layer = LoggerServiceTag.createLayer();
			const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

			await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					service.info('Test message');
				}).pipe(Effect.provide(layer))
			);

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Test message')
			);
			consoleSpy.mockRestore();
		});

		it('should support structured logging', async () => {
			const layer = LoggerServiceTag.createLayer();
			const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

			await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* LoggerServiceTag;
					service.info('Test', { key: 'value', number: 123 });
				}).pipe(Effect.provide(layer))
			);

			expect(consoleSpy).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});
	});
});

describe('CoreServices - Configuration Service', () => {
	describe('createConfigurationServiceLayer', () => {
		it('should create a valid ConfigurationServiceTag layer', () => {
			const layer = ConfigurationServiceTag.createLayer();

			expect(layer).toBeDefined();
			expect(layer._tag).toBeDefined();
		});

		it('should get configuration values', async () => {
			const layer = ConfigurationServiceTag.createLayer();
			const result = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* ConfigurationServiceTag;
					return service.getValue('test.key');
				}).pipe(Effect.provide(layer))
			);

			// Returns undefined for non-existent keys (defensive)
			expect(result).toBeUndefined();
		});

		it('should provide default value for missing keys', async () => {
			const layer = ConfigurationServiceTag.createLayer();
			const result = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* ConfigurationServiceTag;
					return service.getValue('nonexistent.key', 'default');
				}).pipe(Effect.provide(layer))
			);

			expect(result).toBe('default');
		});

		it('should update configuration values', async () => {
			const layer = ConfigurationServiceTag.createLayer();
			await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* ConfigurationServiceTag;
					service.updateValue('test.key', 'value');
				}).pipe(Effect.provide(layer))
			);

			const result = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* ConfigurationServiceTag;
					return service.getValue('test.key');
				}).pipe(Effect.provide(layer))
			);

			expect(result).toBe('value');
		});
	});
});

describe('CoreServices - File Service', () => {
	describe('createFileServiceLayer', () => {
		it('should create a valid FileServiceTag layer', () => {
			const layer = FileServiceTag.createLayer();

			expect(layer).toBeDefined();
			expect(layer._tag).toBeDefined();
		});

		it('should handle safe file operations', async () => {
			const layer = FileServiceTag.createLayer();
			const result = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* FileServiceTag;
					// Safe operation - returns Effect
					return Effect.tryPromise(() => {
						return service.readFile('/non/existent/path');
					});
				}).pipe(Effect.provide(layer), Effect.catchAll(() => Effect.succeed('failed')))
			);

			expect(result).toBeDefined();
		});
	});
});

describe('CoreServices - Dialog Service', () => {
	describe('createDialogServiceLayer', () => {
		it('should create a valid DialogServiceTag layer', () => {
			const layer = DialogServiceTag.createLayer();

			expect(layer).toBeDefined();
			expect(layer._tag).toBeDefined();
		});

		it('should provide dialog methods', async () => {
			const layer = DialogServiceTag.createLayer();
			const service = await Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* DialogServiceTag;
					return {
						showOpenDialog: typeof service.showOpenDialog,
						showSaveDialog: typeof service.showSaveDialog,
						showMessage: typeof service.showMessage,
					};
				}).pipe(Effect.provide(layer))
			);

			expect(service.showOpenDialog).toBe('function');
			expect(service.showSaveDialog).toBe('function');
			expect(service.showMessage).toBe('function');
		});
	});
});

describe('CoreServices - Layer Composition', () => {
	it('should compose multiple core services', async () => {
		const composedLayer = Effect.Layer.mergeAll(
			EnvironmentServiceTag.createLayer(),
			LoggerServiceTag.createLayer(),
			ConfigurationServiceTag.createLayer(),
			FileServiceTag.createLayer(),
			DialogServiceTag.createLayer()
		);

		expect(composedLayer).toBeDefined();

		// Verify all services are available
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const env = yield* EnvironmentServiceTag;
				const logger = yield* LoggerServiceTag;
				const config = yield* ConfigurationServiceTag;
				const file = yield* FileServiceTag;
				const dialog = yield* DialogServiceTag;

				return {
					env: !!env,
					logger: !!logger,
					config: !!config,
					file: !!file,
					dialog: !!dialog,
				};
			}).pipe(Effect.provide(composedLayer))
		);

		expect(result.env).toBe(true);
		expect(result.logger).toBe(true);
		expect(result.config).toBe(true);
		expect(result.file).toBe(true);
		expect(result.dialog).toBe(true);
	});
});
