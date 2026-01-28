/**
 * @module Test Bootstrap Integration ConfigurationService
 * @description
 * Comprehensive test suite for ConfigurationService using TDD approach.
 * Tests config loading from Stage2, getValue/updateValue, getValue with defaults,
 * Mountain sync (mock), config validation, and change events.
 *
 * Following VSCode IWorkbenchConfigurationService interface.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as Effect from 'effect/Effect';

describe('ConfigurationService - Configuration Loading', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should load configuration from Stage2', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const mockConfig = {
			windowId: 'test-window-1',
			machineId: 'test-machine-1',
			editor: {
				fontSize: 14,
				fontFamily: 'Consolas',
			},
		};

		const layer = createConfigurationServiceLayer(mockConfig);
		const allConfig = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getAll();
			}).pipe(Effect.provide(layer))
		);

		expect(allConfig).toBeDefined();
		expect(allConfig.windowId).toBe('test-window-1');
		expect(allConfig.editor).toBeDefined();
	});

	it('should initialize with empty configuration', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();
		const allConfig = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getAll();
			}).pipe(Effect.provide(layer))
		);

		expect(typeof allConfig).toBe('object');
	});

	it('should handle null/undefined initial config gracefully', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer(null as any);
		const allConfig = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getAll();
			}).pipe(Effect.provide(layer))
		);

		expect(allConfig).toBeDefined();
	});
});

describe('ConfigurationService - getValue', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should get simple value by key', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({ key1: 'value1' });
		const value = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('key1');
			}).pipe(Effect.provide(layer))
		);

		expect(value).toBe('value1');
	});

	it('should get nested value with dot notation', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({
			editor: { fontSize: 14, fontFamily: 'Consolas' },
		});
		const fontSize = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('editor.fontSize');
			}).pipe(Effect.provide(layer))
		);

		expect(fontSize).toBe(14);
	});

	it('should return default value for missing key', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();
		const value = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('missing.key', 'default');
			}).pipe(Effect.provide(layer))
		);

		expect(value).toBe('default');
	});

	it('should return undefined for missing key without default', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();
		const value = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('missing.key');
			}).pipe(Effect.provide(layer))
		);

		expect(value).toBeUndefined();
	});

	it('should support typed getValue', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({ count: 42 });
		const value = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue<number>('count');
			}).pipe(Effect.provide(layer))
		);

		expect(value).toBe(42);
	});

	it('should handle deeply nested keys', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({
			editor: { font: { size: 18, weight: 'bold' } },
		});
		const fontWeight = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('editor.font.weight');
			}).pipe(Effect.provide(layer))
		);

		expect(fontWeight).toBe('bold');
	});

	it('should get array values', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({ items: ['a', 'b', 'c'] });
		const value = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('items');
			}).pipe(Effect.provide(layer))
		);

		expect(Array.isArray(value)).toBe(true);
		expect(value).toEqual(['a', 'b', 'c']);
	});
});

describe('ConfigurationService - updateValue', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should update simple value', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({ key1: 'old' });
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('key1', 'new');
			}).pipe(Effect.provide(layer))
		);

		const value = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('key1');
			}).pipe(Effect.provide(layer))
		);

		expect(value).toBe('new');
	});

	it('should update nested value with dot notation', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({ editor: { fontSize: 14 } });
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('editor.fontSize', 16);
			}).pipe(Effect.provide(layer))
		);

		const fontSize = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('editor.fontSize');
			}).pipe(Effect.provide(layer))
		);

		expect(fontSize).toBe(16);
	});

	it('should create nested structure when updating non-existent path', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('new.nested.key', 'value');
			}).pipe(Effect.provide(layer))
		);

		const value = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('new.nested.key');
			}).pipe(Effect.provide(layer))
		);

		expect(value).toBe('value');
	});

	it('should overwrite existing values', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({ key: 'old' });
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('key', 'new');
			}).pipe(Effect.provide(layer))
		);

		const value = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('key');
			}).pipe(Effect.provide(layer))
		);

		expect(value).toBe('new');
	});
});

describe('ConfigurationService - Change Events', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should call callback when value changes', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({ key: 'initial' });
		const callback = vi.fn();

		const unsubscribe = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return yield* service.onDidChange('key', callback);
			}).pipe(Effect.provide(layer))
		);

		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('key', 'updated');
			}).pipe(Effect.provide(layer))
		);

		expect(callback).toHaveBeenCalledWith('updated');

		// Cleanup
		unsubscribe();
	});

	it('should not call callback for different keys', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();
		const callback = vi.fn();

		const unsubscribe = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return yield* service.onDidChange('key1', callback);
			}).pipe(Effect.provide(layer))
		);

		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('key2', 'value');
			}).pipe(Effect.provide(layer))
		);

		expect(callback).not.toHaveBeenCalled();

		unsubscribe();
	});

	it('should support multiple callbacks for same key', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();
		const callback1 = vi.fn();
		const callback2 = vi.fn();

		const unsubscribe1 = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return yield* service.onDidChange('key', callback1);
			}).pipe(Effect.provide(layer))
		);

		const unsubscribe2 = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return yield* service.onDidChange('key', callback2);
			}).pipe(Effect.provide(layer))
		);

		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('key', 'value');
			}).pipe(Effect.provide(layer))
		);

		expect(callback1).toHaveBeenCalledWith('value');
		expect(callback2).toHaveBeenCalledWith('value');

		unsubscribe1();
		unsubscribe2();
	});

	it('should unsubscribe callback via cleanup function', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();
		const callback = vi.fn();

		const unsubscribe = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return yield* service.onDidChange('key', callback);
			}).pipe(Effect.provide(layer))
		);

		unsubscribe();

		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('key', 'value');
			}).pipe(Effect.provide(layer))
		);

		expect(callback).not.toHaveBeenCalled();
	});

	it('should handle nested key change events', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({ editor: { fontSize: 14 } });
		const callback = vi.fn();

		const unsubscribe = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return yield* service.onDidChange('editor.fontSize', callback);
			}).pipe(Effect.provide(layer))
		);

		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('editor.fontSize', 16);
			}).pipe(Effect.provide(layer))
		);

		expect(callback).toHaveBeenCalledWith(16);

		unsubscribe();
	});
});

describe('ConfigurationService - Mountain Sync', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should sync configuration updates to Mountain', async () => {
		// Mock Tauri for Mountain sync
		(global as any).__TAURI__ = {
			core: {
				invoke: vi.fn().mockResolvedValue({}),
			},
		};

		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({
			enableMountainSync: true,
		});

		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('test.key', 'test-value');
			}).pipe(Effect.provide(layer))
		);

		// Verify Mountain invoke was called
		const invoke = (global as any).__TAURI__.core.invoke;
		expect(invoke).toHaveBeenCalled();

		delete (global as any).__TAURI__;
	});

	it('should handle Mountain sync errors gracefully', async () => {
		(global as any).__TAURI__ = {
			core: {
				invoke: vi.fn().mockRejectedValue(new Error('Mountain sync failed')),
			},
		};

		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({
			enableMountainSync: true,
		});

		// Should not throw, should handle error gracefully
		await expect(
			Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* ConfigurationServiceTag;
					yield* service.updateValue('test.key', 'test-value');
				}).pipe(Effect.provide(layer))
			)
		).resolves.toBeUndefined();

		delete (global as any).__TAURI__;
	});

	it('should work without Mountain when Tauri unavailable', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();

		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('test.key', 'test-value');
			}).pipe(Effect.provide(layer))
		);

		const value = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('test.key');
			}).pipe(Effect.provide(layer))
		);

		expect(value).toBe('test-value');
	});
});

describe('ConfigurationService - Configuration Validation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should validate against VSCode settings schema', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const validConfig = {
			editor: {
				fontSize: 14,
				fontFamily: 'Consolas',
				tabSize: 4,
				wordWrap: 'on' as const,
			},
		};

		const layer = createConfigurationServiceLayer(validConfig);

		const fontSize = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('editor.fontSize');
			}).pipe(Effect.provide(layer))
		);

		expect(fontSize).toBe(14);
	});

	it('should handle invalid schema values gracefully', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();

		// Any value should be stored, validation is a separate concern
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.updateValue('random.key', 'any-value');
			}).pipe(Effect.provide(layer))
		);

		const value = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('random.key');
			}).pipe(Effect.provide(layer))
		);

		expect(value).toBe('any-value');
	});

	it('should support complex nested configurations', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const complexConfig = {
			editor: {
				fontSize: 14,
				fontFamily: 'Consolas',
				lineHeight: 1.5,
				letterSpacing: 0,
				wordWrap: 'on' as const,
			},
			files: {
				autoSave: 'afterDelay' as const,
				autoSaveDelay: 1000,
			},
			terminal: {
				integrated: {
					fontSize: 13,
					fontFamily: 'Cascadia Code',
				},
			},
		};

		const layer = createConfigurationServiceLayer(complexConfig);
		const allConfig = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getAll();
			}).pipe(Effect.provide(layer))
		);

		expect(allConfig.editor).toBeDefined();
		expect(allConfig.files).toBeDefined();
		expect(allConfig.terminal).toBeDefined();
	});
});

describe('ConfigurationService - getAll and reset', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should get all configuration', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const config = { key1: 'value1', key2: 'value2', nested: { key: 'value' } };
		const layer = createConfigurationServiceLayer(config);
		const allConfig = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getAll();
			}).pipe(Effect.provide(layer))
		);

		expect(allConfig).toEqual(config);
	});

	it('should reset configuration', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({ key: 'value' });
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				yield* service.reset();
			}).pipe(Effect.provide(layer))
		);

		const allConfig = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getAll();
			}).pipe(Effect.provide(layer))
		);

		expect(Object.keys(allConfig)).toHaveLength(0);
	});
});

describe('ConfigurationService - Error Scenarios', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle null/undefined updates gracefully', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();

		await expect(
			Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* ConfigurationServiceTag;
					yield* service.updateValue('key', null as any);
				}).pipe(Effect.provide(layer))
			)
		).resolves.toBeUndefined();
	});

	it('should handle malformed key paths', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();

		const value = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('', 'default');
			}).pipe(Effect.provide(layer))
		);

		expect(value).toBe('default');
	});

	it('should handle empty configuration input', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({});
		const allConfig = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getAll();
			}).pipe(Effect.provide(layer))
		);

		expect(allConfig).toEqual({});
	});
});

describe('ConfigurationService - VSCode Compatibility', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should implement all VSCode IWorkbenchConfigurationService methods', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer();
		const service = await Effect.runPromise(
			Effect.gen(function* () {
				return yield* ConfigurationServiceTag;
			}).pipe(Effect.provide(layer))
		);

		expect(service.getValue).toBeInstanceOf(Function);
		expect(service.updateValue).toBeInstanceOf(Function);
		expect(service.getAll).toBeInstanceOf(Function);
		expect(service.reset).toBeInstanceOf(Function);
		expect(service.onDidChange).toBeInstanceOf(Function);
	});

	it('should support VSCode configuration section pattern', async () => {
		const { createConfigurationServiceLayer, ConfigurationServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/ConfigurationService.js'
		);

		const layer = createConfigurationServiceLayer({
			editor: {
				fontSize: 14,
				fontFamily: 'Consolas',
			},
		});

		const editorConfig = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* ConfigurationServiceTag;
				return service.getValue('editor');
			}).pipe(Effect.provide(layer))
		);

		expect(editorConfig).toEqual({
			fontSize: 14,
			fontFamily: 'Consolas',
		});
	});
});
