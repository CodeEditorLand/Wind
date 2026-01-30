/**
 * @module Test Bootstrap Integration FileService
 * @description
 * Comprehensive test suite for FileService using TDD approach.
 * Tests all file operations (mock Tauri), URI to path mapping, file watching (mock),
 * error scenarios, and Effect-TS wrappers.
 *
 * Following VSCode IFileService interface with full VSCode API.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as Effect from 'effect/Effect';

// Mock Tauri fs plugin
const mockReadTextFile = vi.fn();
const mockWriteTextFile = vi.fn();
const mockExists = vi.fn();
const mockStat = vi.fn();
const mockMkdir = vi.fn();
const mockRemove = vi.fn();
const mockWatch = vi.fn();
const mockReaddir = vi.fn();
const mockReadDir = vi.fn(); // Newer Tauri API name
const mockCopyFile = vi.fn();
const mockRename = vi.fn();

vi.mock('@tauri-apps/plugin-fs', () => ({
	readTextFile: mockReadTextFile,
	writeTextFile: mockWriteTextFile,
	exists: mockExists,
	stat: mockStat,
	mkdir: mockMkdir,
	remove: mockRemove,
	watch: mockWatch,
	readdir: mockReaddir,
	readDir: mockReadDir,
	copyFile: mockCopyFile,
	rename: mockRename,
}));

describe('FileService - readFile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should read file content successfully', async () => {
		mockReadTextFile.mockResolvedValue('File content');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			"../../../../Source/Bootstrap/Integration/Core/CoreServices.ts"
		);

		const layer = createFileServiceLayer();
		const content = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.readFile('/test/path.txt');
			}).pipe(Effect.provide(layer))
		);

		expect(content).toBe('File content');
		expect(mockReadTextFile).toHaveBeenCalledWith('/test/path.txt');

		delete (global as any).__TAURI__;
	});

	it('should handle file read errors', async () => {
		mockReadTextFile.mockRejectedValue(new Error('File not found'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			service.readFile('/nonexistent/file.txt').pipe(
				Effect.provide(layer),
				Effect.catchAll((error) => Effect.succeed(`Error: ${error.message}`))
			)
		);

		expect(result).toContain('File not found');

		delete (global as any).__TAURI__;
	});

	it('should handle Tauri unavailability', async () => {
		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.readFile('/test/path.txt');
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('Failed to read file');
	});

	it('should read UTF-8 encoded files', async () => {
		mockReadTextFile.mockResolvedValue('UTF-8 content with special chars: 你好世界');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const content = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.readFile('/test/utf8.txt');
			}).pipe(Effect.provide(layer))
		);

		expect(content).toContain('你好世界');

		delete (global as any).__TAURI__;
	});
});

describe('FileService - writeFile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should write file content successfully', async () => {
		mockWriteTextFile.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.writeFile('/test/path.txt', 'New content');
			}).pipe(Effect.provide(layer))
		);

		expect(mockWriteTextFile).toHaveBeenCalledWith('/test/path.txt', 'New content');

		delete (global as any).__TAURI__;
	});

	it('should handle write errors', async () => {
		mockWriteTextFile.mockRejectedValue(new Error('Permission denied'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.writeFile('/test/path.txt', 'Content');
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('Permission denied');

		delete (global as any).__TAURI__;
	});

	it('should write UTF-8 content', async () => {
		mockWriteTextFile.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const content = 'UTF-8 content: 你好世界 🚀✨';
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.writeFile('/test/path.txt', content);
			}).pipe(Effect.provide(layer))
		);

		expect(mockWriteTextFile).toHaveBeenCalledWith('/test/path.txt', content);

		delete (global as any).__TAURI__;
	});
});

describe('FileService - exists', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return true for existing file', async () => {
		mockExists.mockResolvedValue(true);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const exists = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.exists('/test/file.txt');
			}).pipe(Effect.provide(layer))
		);

		expect(exists).toBe(true);

		delete (global as any).__TAURI__;
	});

	it('should return false for non-existing file', async () => {
		mockExists.mockResolvedValue(false);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const exists = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.exists('/nonexistent/file.txt');
			}).pipe(Effect.provide(layer))
		);

		expect(exists).toBe(false);

		delete (global as any).__TAURI__;
	});

	it('should handle check errors gracefully', async () => {
		mockExists.mockRejectedValue(new Error('IO error'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.exists('/test/file.txt');
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(false)))
		);

		expect(result).toBe(false);

		delete (global as any).__TAURI__;
	});
});

describe('FileService - stat', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should get file statistics', async () => {
		mockStat.mockResolvedValue({
			isFile: true,
			isDirectory: false,
			isSymlink: false,
			size: 1024,
			mtime: new Date('2024-01-01'),
		});
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const stats = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.stat('/test/file.txt');
			}).pipe(Effect.provide(layer))
		);

		expect(stats.isFile).toBe(true);
		expect(stats.isDirectory).toBe(false);
		expect(stats.size).toBe(1024);
		expect(stats.modified).toBeDefined();

		delete (global as any).__TAURI__;
	});

	it('should get directory statistics', async () => {
		mockStat.mockResolvedValue({
			isFile: false,
			isDirectory: true,
			isSymlink: false,
			size: 4096,
			mtime: new Date('2024-01-01'),
		});
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const stats = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.stat('/test/directory');
			}).pipe(Effect.provide(layer))
		);

		expect(stats.isDirectory).toBe(true);
		expect(stats.isFile).toBe(false);

		delete (global as any).__TAURI__;
	});

	it('should handle stat errors', async () => {
		mockStat.mockRejectedValue(new Error('Not found'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.stat('/test/file.txt');
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('Not found');

		delete (global as any).__TAURI__;
	});
});

describe('FileService - mkdir', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create directory', async () => {
		mockMkdir.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.mkdir('/test/newdir');
			}).pipe(Effect.provide(layer))
		);

		expect(mockMkdir).toHaveBeenCalledWith('/test/newdir', { recursive: true });

		delete (global as any).__TAURI__;
	});

	it('should create nested directories', async () => {
		mockMkdir.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.mkdir('/test/nested/path/subdir');
			}).pipe(Effect.provide(layer))
		);

		expect(mockMkdir).toHaveBeenCalledWith('/test/nested/path/subdir', {
			recursive: true,
		});

		delete (global as any).__TAURI__;
	});

	it('should handle mkdir errors', async () => {
		mockMkdir.mockRejectedValue(new Error('Permission denied'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.mkdir('/restricted/dir');
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('Permission denied');

		delete (global as any).__TAURI__;
	});
});

describe('FileService - delete', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should delete file', async () => {
		mockRemove.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.delete('/test/file.txt');
			}).pipe(Effect.provide(layer))
		);

		expect(mockRemove).toHaveBeenCalledWith('/test/file.txt', { recursive: true });

		delete (global as any).__TAURI__;
	});

	it('should delete directory recursively', async () => {
		mockRemove.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.delete('/test/directory');
			}).pipe(Effect.provide(layer))
		);

		expect(mockRemove).toHaveBeenCalledWith('/test/directory', { recursive: true });

		delete (global as any).__TAURI__;
	});

	it('should handle delete errors', async () => {
		mockRemove.mockRejectedValue(new Error('File in use'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.delete('/test/file.txt');
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('File in use');

		delete (global as any).__TAURI__;
	});
});

describe('FileService - readdir', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should read directory contents', async () => {
		mockReadDir.mockResolvedValue([
			{ name: 'file1.txt', isFile: true, isDirectory: false },
			{ name: 'file2.txt', isFile: true, isDirectory: false },
			{ name: 'subdir', isFile: false, isDirectory: true },
		]);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const entries = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.readdir('/test');
			}).pipe(Effect.provide(layer))
		);

		expect(entries).toHaveLength(3);
		expect(entries[0].name).toBe('file1.txt');
		expect(entries[2].name).toBe('subdir');

		delete (global as any).__TAURI__;
	});

	it('should handle readdir errors', async () => {
		mockReadDir.mockRejectedValue(new Error('Not a directory'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.readdir('/test/file.txt');
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('Not a directory');

		delete (global as any).__TAURI__;
	});
});

describe('FileService - copy', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should copy file', async () => {
		mockCopyFile.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.copy('/test/source.txt', '/test/dest.txt');
			}).pipe(Effect.provide(layer))
		);

		expect(mockCopyFile).toHaveBeenCalledWith('/test/source.txt', '/test/dest.txt');

		delete (global as any).__TAURI__;
	});

	it('should handle copy errors', async () => {
		mockCopyFile.mockRejectedValue(new Error('Source not found'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.copy('/nonexistent.txt', '/dest.txt');
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('Source not found');

		delete (global as any).__TAURI__;
	});
});

describe('FileService - move', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should move/rename file', async () => {
		mockRename.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.move('/test/old.txt', '/test/new.txt');
			}).pipe(Effect.provide(layer))
		);

		expect(mockRename).toHaveBeenCalledWith('/test/old.txt', '/test/new.txt');

		delete (global as any).__TAURI__;
	});

	it('should handle move errors', async () => {
		mockRename.mockRejectedValue(new Error('Destination exists'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				yield* service.move('/test/file.txt', '/test/existing.txt');
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('Destination exists');

		delete (global as any).__TAURI__;
	});
});

describe('FileService - File Watching', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should watch file for changes', async () => {
		const mockUnwatch = vi.fn();
		mockWatch.mockResolvedValue(mockUnwatch);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const callback = vi.fn();

		const unwatch = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.watch('/test/file.txt', callback);
			}).pipe(Effect.provide(layer))
		);

		expect(mockWatch).toHaveBeenCalled();
		expect(typeof unwatch).toBe('function');

		// Cleanup
		unwatch();

		delete (global as any).__TAURI__;
	});

	it('should cleanup when unwatch is called', async () => {
		const mockUnwatch = vi.fn();
		mockWatch.mockResolvedValue(mockUnwatch);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const callback = vi.fn();

		const unwatch = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.watch('/test/file.txt', callback);
			}).pipe(Effect.provide(layer))
		);

		unwatch();

		expect(mockUnwatch).toHaveBeenCalled();

		delete (global as any).__TAURI__;
	});

	it('should handle watch errors', async () => {
		mockWatch.mockRejectedValue(new Error('Cannot watch path'));
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const callback = vi.fn();

		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.watch('/test/file.txt', callback);
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toContain('Cannot watch path');

		delete (global as any).__TAURI__;
	});
});

describe('FileService - URI Mapping', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should convert URI to OS path for tauri:// scheme', async () => {
		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const path = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return service.uriToPath('tauri:///C:/Users/test/file.txt');
			}).pipe(Effect.provide(layer))
		);

		// Should strip tauri:// prefix and convert slashes
		expect(path).toContain('C:/Users/test/file.txt');
	});

	it('should convert URI to OS path for file:// scheme', async () => {
		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const path = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return service.uriToPath('file:///home/user/file.txt');
			}).pipe(Effect.provide(layer))
		);

		expect(path).toContain('/home/user/file.txt');
	});

	it('should return path as-is for no scheme', async () => {
		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const path = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return service.uriToPath('/absolute/path/file.txt');
			}).pipe(Effect.provide(layer))
		);

		expect(path).toBe('/absolute/path/file.txt');
	});

	it('should convert OS path to URI', async () => {
		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const uri = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return service.pathToUri('/C:/Users/test/file.txt');
			}).pipe(Effect.provide(layer))
		);

		expect(uri).toContain('file://');

		delete (global as any).__TAURI__;
	});
});

describe('FileService - Error Scenarios', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle invalid paths', async () => {
		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.readFile('');
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toBeDefined();
	});

	it('should handle null/undefined paths gracefully', async () => {
		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.readFile(null as any);
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		expect(result).toBeDefined();
	});

	it('should work without Tauri (browser fallback)', async () => {
		delete (global as any).__TAURI__;

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const result = await Effect.runPromise(
			Effect.gen(function* () {
				const service = yield* FileServiceTag;
				return yield* service.readFile('/test/file.txt');
			}).pipe(Effect.provide(layer), Effect.catchAll((e) => Effect.succeed(e.message)))
		);

		// Should gracefully indicate Tauri unavailability
		expect(result).toBeDefined();
	});
});

describe('FileService - Effect-TS Wrappers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should provide readFileEffect wrapper', async () => {
		mockReadTextFile.mockResolvedValue('content');
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag, readFileEffect } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const content = await Effect.runPromise(
			readFileEffect('/test/file.txt').pipe(Effect.provide(layer))
		);

		expect(content).toBe('content');

		delete (global as any).__TAURI__;
	});

	it('should support Effect composition for file operations', async () => {
		mockReadTextFile.mockResolvedValue('original');
		mockWriteTextFile.mockResolvedValue(undefined);
		(global as any).__TAURI__ = { core: { invoke: vi.fn() } };

		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();

		const program = Effect.gen(function* () {
			const service = yield* FileServiceTag;
			const content = yield* service.readFile('/test/source.txt');
			const modified = content.toUpperCase();
			yield* service.writeFile('/test/dest.txt', modified);
			return modified;
		});

		const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

		expect(result).toBe('ORIGINAL');

		delete (global as any).__TAURI__;
	});
});

describe('FileService - VSCode Compatibility', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should implement all VSCode IFileService methods', async () => {
		const { createFileServiceLayer, FileServiceTag } = await import(
			'../../../../Source/Bootstrap/Integration/Services/FileService.ts'
		);

		const layer = createFileServiceLayer();
		const service = await Effect.runPromise(
			Effect.gen(function* () {
				return yield* FileServiceTag;
			}).pipe(Effect.provide(layer))
		);

		// VSCode IFileService methods
		expect(service.readFile).toBeInstanceOf(Function);
		expect(service.writeFile).toBeInstanceOf(Function);
		expect(service.exists).toBeInstanceOf(Function);
		expect(service.stat).toBeInstanceOf(Function);
		expect(service.mkdir).toBeInstanceOf(Function);
		expect(service.delete).toBeInstanceOf(Function);
		expect(service.readdir).toBeInstanceOf(Function);
		expect(service.copy).toBeInstanceOf(Function);
		expect(service.move).toBeInstanceOf(Function);
		expect(service.watch).toBeInstanceOf(Function);
		expect(service.uriToPath).toBeInstanceOf(Function);
		expect(service.pathToUri).toBeInstanceOf(Function);
	});
});
