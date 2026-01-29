/**
 * @module Test Bootstrap Integration DialogService
 * @description
 * Comprehensive test suite for DialogService using TDD approach.
 * Tests open dialog (mock Tauri), save dialog, message box, browser fallback,
 * filters and options.
 *
 * Following VSCode IFileDialogService interface using @tauri-apps/plugin-dialog.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as Effect from 'effect/Effect';

// Mock Tauri dialog plugin
const mockOpen = vi.fn();
const mockSave = vi.fn();
const mockMessage = vi.fn();

vi.mock('@tauri-apps/plugin-dialog', () => ({
	open: mockOpen,
	save: mockSave,
	message: mockMessage,
}));

describe('DialogService - showOpenDialog', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		delete (global as any).window;
		delete (global as any).alert;
	});

	it('should show open file dialog with defaults', async () => {
		mockOpen.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			"../../../../Source/Bootstrap/Integration/Core/CoreServices.ts"
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog();
			}).pipe(Effect.provide(layer))
		);

		expect(result).toEqual(['/test/file.txt']);
		expect(mockOpen).toHaveBeenCalled();

		delete (global as any).__TAURI__;
	});

	it('should show open dialog with title', async () => {
		mockOpen.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog({ title: 'Select File' });
			}).pipe(Effect.provide(layer))
		);

		expect(mockOpen).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Select File',
			})
		);

		delete (global as any).__TAURI__;
	});

	it('should show open dialog with defaultPath', async () => {
		mockOpen.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog({ defaultPath: '/home/user' });
			}).pipe(Effect.provide(layer))
		);

		expect(mockOpen).toHaveBeenCalledWith(
			expect.objectContaining({
				defaultPath: '/home/user',
			})
		);

		delete (global as any).__TAURI__;
	});

	it('should show open dialog with file filters', async () => {
		mockOpen.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const filters = [
			{ name: 'Text Files', extensions: ['txt', 'md'] },
			{ name: 'All Files', extensions: ['*'] },
		];

		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog({ filters });
			}).pipe(Effect.provide(layer))
		);

		expect(mockOpen).toHaveBeenCalledWith(
			expect.objectContaining({
				filters,
			})
		);

		delete (global as any).__TAURI__;
	});

	it('should show open dialog with multiple selection', async () => {
		mockOpen.mockResolvedValue(['/test/file1.txt', '/test/file2.txt']);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog({ multiple: true });
			}).pipe(Effect.provide(layer))
		);

		expect(result).toEqual(['/test/file1.txt', '/test/file2.txt']);
		expect(mockOpen).toHaveBeenCalledWith(
			expect.objectContaining({
				multiple: true,
			})
		);

		delete (global as any).__TAURI__;
	});

	it('should handle single file selection', async () => {
		mockOpen.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog({ multiple: false });
			}).pipe(Effect.provide(layer))
		);

		expect(result).toEqual(['/test/file.txt']);

		delete (global as any).__TAURI__;
	});

	it('should show open directory dialog', async () => {
		mockOpen.mockResolvedValue('/test/directory');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog({ directory: true });
			}).pipe(Effect.provide(layer))
		);

		expect(mockOpen).toHaveBeenCalledWith(
			expect.objectContaining({
				directory: true,
			})
		);

		delete (global as any).__TAURI__;
	});

	it('should handle dialog cancellation (null return)', async () => {
		mockOpen.mockResolvedValue(null);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog();
			}).pipe(Effect.provide(layer))
		);

		expect(result).toEqual([]);

		delete (global as any).__TAURI__;
	});

	it('should handle open dialog errors', async () => {
		mockOpen.mockRejectedValue(new Error('Dialog failed'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog();
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('Dialog failed');

		delete (global as any).__TAURI__;
	});
});

describe('DialogService - showSaveDialog', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should show save file dialog with defaults', async () => {
		mockSave.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showSaveDialog();
			}).pipe(Effect.provide(layer))
		);

		expect(result).toBe('/test/file.txt');
		expect(mockSave).toHaveBeenCalled();

		delete (global as any).__TAURI__;
	});

	it('should show save dialog with title', async () => {
		mockSave.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showSaveDialog({ title: 'Save File' });
			}).pipe(Effect.provide(layer))
		);

		expect(mockSave).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Save File',
			})
		);

		delete (global as any).__TAURI__;
	});

	it('should show save dialog with defaultPath', async () => {
		mockSave.mockResolvedValue('/test/newfile.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showSaveDialog({
					defaultPath: '/home/user/newfile.txt',
				});
			}).pipe(Effect.provide(layer))
		);

		expect(mockSave).toHaveBeenCalledWith(
			expect.objectContaining({
				defaultPath: '/home/user/newfile.txt',
			})
		);

		delete (global as any).__TAURI__;
	});

	it('should show save dialog with file filters', async () => {
		mockSave.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const filters = [
			{ name: 'Text Files', extensions: ['txt'] },
			{ name: 'Markdown', extensions: ['md'] },
		];

		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showSaveDialog({ filters });
			}).pipe(Effect.provide(layer))
		);

		expect(mockSave).toHaveBeenCalledWith(
			expect.objectContaining({
				filters,
			})
		);

		delete (global as any).__TAURI__;
	});

	it('should handle save dialog cancellation (null return)', async () => {
		mockSave.mockResolvedValue(null);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showSaveDialog();
			}).pipe(Effect.provide(layer))
		);

		expect(result).toBeNull();

		delete (global as any).__TAURI__;
	});

	it('should handle save dialog errors', async () => {
		mockSave.mockRejectedValue(new Error('Save dialog failed'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showSaveDialog();
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('Save dialog failed');

		delete (global as any).__TAURI__;
	});
});

describe('DialogService - showMessage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should show info message', async () => {
		mockMessage.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showMessage({
					message: 'Operation completed',
					type: 'info',
				});
			}).pipe(Effect.provide(layer))
		);

		expect(mockMessage).toHaveBeenCalledWith(
			'Operation completed',
			undefined,
			expect.any(String)
		);

		delete (global as any).__TAURI__;
	});

	it('should show warning message', async () => {
		mockMessage.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showMessage({
					title: 'Warning',
					message: 'Unsaved changes',
					type: 'warning',
				});
			}).pipe(Effect.provide(layer))
		);

		expect(mockMessage).toHaveBeenCalledWith(
			'Unsaved changes',
			'Warning',
			expect.stringContaining('warn')
		);

		delete (global as any).__TAURI__;
	});

	it('should show error message', async () => {
		mockMessage.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showMessage({
					title: 'Error',
					message: 'Operation failed',
					type: 'error',
				});
			}).pipe(Effect.provide(layer))
		);

		expect(mockMessage).toHaveBeenCalledWith(
			'Operation failed',
			'Error',
			expect.stringContaining('error')
		);

		delete (global as any).__TAURI__;
	});

	it('should handle message dialog errors', async () => {
		mockMessage.mockRejectedValue(new Error('Message dialog failed'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showMessage({ message: 'Test' });
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('Message dialog failed');

		delete (global as any).__TAURI__;
	});
});

describe('DialogService - Browser Fallback', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fallback to browser prompt for open dialog', async () => {
		const mockPrompt = vi.fn().mockReturnValue('/test/file.txt');
		(global as any).window = { prompt: mockPrompt };

		delete (global as any).__TAURI__;

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog({ title: 'Open File' });
			}).pipe(Effect.provide(layer))
		);

		// Browser fallback returns empty array if canceled, or array of entered path
		expect(mockPrompt).toHaveBeenCalled();

		delete (global as any).window;
	});

	it('should fallback to browser prompt for save dialog', async () => {
		const mockPrompt = vi.fn().mockReturnValue('/test/save.txt');
		(global as any).window = { prompt: mockPrompt };

		delete (global as any).__TAURI__;

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showSaveDialog({ title: 'Save File' });
			}).pipe(Effect.provide(layer))
		);

		expect(mockPrompt).toHaveBeenCalled();

		delete (global as any).window;
	});

	it('should fallback to browser alert for message dialog', async () => {
		const mockAlert = vi.fn();
		(global as any).window = { alert: mockAlert };

		delete (global as any).__TAURI__;

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showMessage({
					title: 'Notice',
					message: 'Important message',
					type: 'info',
				});
			}).pipe(Effect.provide(layer))
		);

		expect(mockAlert).toHaveBeenCalledWith(
			expect.stringContaining('Important message')
		);

		delete (global as any).window;
	});

	it('should handle browser fallback gracefully when alert unavailable', async () => {
		(global as any).window = {}; // No alert
		delete (global as any).__TAURI__;

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		// Should not throw
		await expect(
			Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* DialogServiceTag;
					return yield* service.showMessage({
						message: 'Test',
						type: 'info',
					});
				}).pipe(Effect.provide(layer))
			)
		).resolves.toBeUndefined();

		delete (global as any).window;
	});
});

describe('DialogService - Filters and Options', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should apply multiple file filters correctly', async () => {
		mockOpen.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const filters = [
			{ name: 'JavaScript', extensions: ['js', 'jsx', 'mjs'] },
			{ name: 'TypeScript', extensions: ['ts', 'tsx'] },
			{ name: 'Text', extensions: ['txt', 'md'] },
			{ name: 'All Files', extensions: ['*'] },
		];

		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog({ filters });
			}).pipe(Effect.provide(layer))
		);

		const callArgs = mockOpen.mock.calls[0][0];
		expect(callArgs.filters).toEqual(filters);

		delete (global as any).__TAURI__;
	});

	it('should handle filter with single extension', async () => {
		mockOpen.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog({
					filters: [{ name: 'Text Files', extensions: ['txt'] }],
				});
			}).pipe(Effect.provide(layer))
		);

		expect(mockOpen).toHaveBeenCalled();

		delete (global as any).__TAURI__;
	});

	it('should handle empty options object', async () => {
		mockOpen.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog({});
			}).pipe(Effect.provide(layer))
		);

		expect(mockOpen).toHaveBeenCalled();

		delete (global as any).__TAURI__;
	});
});

describe('DialogService - Effect-TS Wrappers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should provide showOpenDialogEffect wrapper', async () => {
		mockOpen.mockResolvedValue('/test/file.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const {
			createDialogServiceLayer,
			DialogServiceTag,
			showOpenDialogEffect,
		} = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			showOpenDialogEffect({ title: 'Open' }).pipe(Effect.provide(layer))
		);

		expect(result).toEqual(['/test/file.txt']);

		delete (global as any).__TAURI__;
	});

	it('should support Effect composition with dialogs', async () => {
		mockOpen.mockResolvedValue('/test/file.txt');
		mockSave.mockResolvedValue('/test/modified.txt');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();

		const program = Effect.gen(function* () {
			const service = yield* DialogServiceTag;
			const files = yield* service.showOpenDialog({ title: 'Open' });

			if (files.length > 0) {
				const savePath = yield* service.showSaveDialog({
					title: 'Save As',
				});
				return savePath;
			}

			return null;
		});

		const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

		expect(result).toBe('/test/modified.txt');

		delete (global as any).__TAURI__;
	});
});

describe('DialogService - Error Scenarios', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle null/undefined options', async () => {
		mockOpen.mockResolvedValue(null);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* DialogServiceTag;
				return yield* service.showOpenDialog(null as any);
			}).pipe(Effect.provide(layer))
		);

		expect(result).toEqual([]);

		delete (global as any).__TAURI__;
	});

	it('should handle special characters in message', async () => {
		mockMessage.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const message = 'Message with special chars: "quotes" and \'apostrophes\' and \n newlines';

		await expect(
			Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* DialogServiceTag;
					return yield* service.showMessage({ message, type: 'info' });
				}).pipe(Effect.provide(layer))
			)
		).resolves.toBeUndefined();

		expect(mockMessage).toHaveBeenCalledWith(
			expect.stringContaining('special chars')
		);

		delete (global as any).__TAURI__;
	});

	it('should handle very long messages', async () => {
		mockMessage.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const longMessage = 'x'.repeat(10000);

		await expect(
			Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* DialogServiceTag;
					return yield* service.showMessage({ message: longMessage, type: 'info' });
				}).pipe(Effect.provide(layer))
			)
		).resolves.toBeUndefined();

		expect(mockMessage).toHaveBeenCalled();

		delete (global as any).__TAURI__;
	});
});

describe('DialogService - VSCode Compatibility', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should implement all VSCode IFileDialogService methods', async () => {
		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const service = await Effect.runPromise(
			Effect.gen(function* () {
				return yield* DialogServiceTag;
			}).pipe(Effect.provide(layer))
		);

		// VSCode IFileDialogService methods
		expect(service.showOpenDialog).toBeInstanceOf(Function);
		expect(service.showSaveDialog).toBeInstanceOf(Function);
		expect(service.showMessage).toBeInstanceOf(Function);
	});

	it('should match VSCode dialog option structure', async () => {
		const { createDialogServiceLayer, DialogServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/DialogService.js'
		);

		const layer = createDialogServiceLayer();
		const options = {
			title: 'Select File',
			defaultPath: '/home/user',
			filters: [{ name: 'Text', extensions: ['txt'] }],
			multiple: false,
		};

		// Just verify options are accepted
		await expect(
			Effect.runPromise(
				Effect.gen(function* () {
					const service = yield* DialogServiceTag;
					return yield* service.showOpenDialog(options);
				}).pipe(Effect.provide(layer), Effect.catchAll(() => Effect.success(undefined)))
			)
		).resolves.toBeUndefined();
	});
});
