/**
 * @module Bootstrap/Integration/Services/FileService
 * @description
 * File operations service following VSCode IFileService interface with Tauri integration.
 *
 * Features:
 * - Tauri fs integration: @tauri-apps/plugin-fs
 * - Operations: readFile, writeFile, exists, stat, mkdir, delete, readdir, copy, move
 * - File watch via Tauri watch() API
 * - URI mapping to OS paths
 * - Effect-TS wrappers for all operations
 * - Comprehensive error handling
 *
 * VSCode IFileService Methods:
 * - readFile(uri): Promise<Uint8Array>
 * - writeFile(uri, content): Promise<void>
 * - exists(uri): Promise<boolean>
 * - stat(uri): Promise<IFileStat>
 * - mkdir(uri): Promise<void>
 * - delete(uri): Promise<void>
 * - readdir(uri): Promise<[string, FileType][]>
 * - createFile(uri)
 * - createFolder(uri)
 * - move(source, target)
 * - copy(source, target)
 */

import * as Effect from 'effect/Effect';
import { invoke } from '@tauri-apps/api/core';

// ============================================================================
// TYPES
// ============================================================================

/**
 * File statistics
 */
export interface FileStat {
	/** Is this a file? */
	isFile: boolean;
	/** Is this a directory? */
	isDirectory: boolean;
	/** Is this a symbolic link? */
	isSymlink?: boolean;
	/** File size in bytes */
	size: number;
	/** Last modified time (timestamp) */
	modified: number;
	/** Last accessed time (timestamp) */
	accessed?: number;
	/** Created time (timestamp) */
	created?: number;
}

/**
 * Directory entry
 */
export interface DirEntry {
	/** Entry name */
	name: string;
	/** Is this a file? */
	isFile: boolean;
	/** Is this a directory? */
	isDirectory: boolean;
	/** Is this a symbolic link? */
	isSymlink?: boolean;
}

/**
 * FileType enum for readdir
 */
export enum FileType {
	Unknown = 0,
	File = 1,
	Directory = 2,
	SymbolicLink = 64,
}

/**
 * File service interface following VSCode IFileService
 */
export interface FileService {
	/**
	 * Read file content as string
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
	stat: (path: string) => Effect.Effect<FileStat>;

	/**
	 * Create directory (recursive by default)
	 */
	mkdir: (path: string) => Effect.Effect<void>;

	/**
	 * Delete file/directory (recursive by default)
	 */
	delete: (path: string) => Effect.Effect<void>;

	/**
	 * Read directory contents
	 */
	readdir: (path: string) => Effect.Effect<DirEntry[]>;

	/**
	 * Copy file/directory
	 */
	copy: (source: string, destination: string) => Effect.Effect<void>;

	/**
	 * Move/rename file/directory
	 */
	move: (source: string, destination: string) => Effect.Effect<void>;

	/**
	 * Watch file/directory for changes
	 * @returns cleanup function to stop watching
	 */
	watch: (path: string, callback: () => void) => Effect.Effect<() => void>;

	/**
	 * Convert URI to OS path
	 */
	uriToPath: (uri: string) => string;

	/**
	 * Convert OS path to URI
	 */
	pathToUri: (path: string) => string;

	/**
	 * Read file as binary data (Uint8Array)
	 */
	readBinaryFile: (path: string) => Effect.Effect<Uint8Array>;

	/**
	 * Write binary data (Uint8Array)
	 */
	writeBinaryFile: (path: string, content: Uint8Array) => Effect.Effect<void>;
}

// ============================================================================
// CONTEXT TAG
// ============================================================================

export const FileServiceTag = Effect.Tag<FileService, FileService>(
	'FileService'
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if Tauri is available
 */
function isTauriAvailable(): boolean {
	return typeof (globalThis as any).__TAURI__ !== 'undefined';
}

/**
 * Convert URI to OS path
 */
function uriToPathImpl(uri: string): string {
	// Handle tauri:// URIs
	if (uri.startsWith('tauri://')) {
		return uri.substring(8);
	}

	// Handle file:// URIs
	if (uri.startsWith('file:///')) {
		return decodeURIComponent(uri.substring(8));
	}

	if (uri.startsWith('file://')) {
		return decodeURIComponent(uri.substring(7));
	}

	// Return as-is for relative/absolute paths
	return uri;
}

/**
 * Convert OS path to URI
 */
function pathToUriImpl(path: string): string {
	// If already a URI, return as-is
	if (path.startsWith('file://') || path.startsWith('tauri://')) {
		return path;
	}

	// Convert to file:// URI
	// Ensure path starts with /
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `file://${encodeURI(normalizedPath)}`;
}

/**
 * Normalize path separators
 */
function normalizePath(path: string): string {
	return path.replace(/\\/g, '/');
}

/**
 * Convert Tauri file stats to FileStat
 */
function convertTauriStats(stats: any): FileStat {
	return {
		isFile: stats.isFile,
		isDirectory: stats.isDirectory,
		isSymlink: stats.isSymlink,
		size: stats.size,
		modified: stats.mtime?.getTime() || 0,
		accessed: stats.atime?.getTime(),
		created: stats.birthtime?.getTime(),
	};
}

/**
 * Convert Tauri dir entry to DirEntry
 */
function convertTauriDirEntry(entry: any): DirEntry {
	return {
		name: entry.name,
		isFile: entry.isFile,
		isDirectory: entry.isDirectory,
		isSymlink: entry.isSymlink,
	};
}

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

const FileServiceImpl = FileServiceTag.of({
	readFile: (path: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriAvailable()) {
					throw new Error('Tauri not available');
				}

				const result = await invoke('mountain_ipc_invoke', {
					command: 'file:read',
					args: [path]
				});
				return result as string;
			},
			catch: (error) => {
				return new Error(`Failed to read file ${path}: ${error}`);
			},
		});
	},

	writeFile: (path: string, content: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriAvailable()) {
					throw new Error('Tauri not available');
				}

				await invoke('mountain_ipc_invoke', {
					command: 'file:write',
					args: [path, content]
				});
			},
			catch: (error) => {
				return new Error(`Failed to write file ${path}: ${error}`);
			},
		});
	},

	exists: (path: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriAvailable()) {
					return false;
				}

				const result = await invoke('mountain_ipc_invoke', {
					command: 'file:exists',
					args: [path]
				});
				return result as boolean;
			},
			catch: () => {
				return false;
			},
		});
	},

	stat: (path: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriAvailable()) {
					throw new Error('Tauri not available');
				}

				const result = await invoke('mountain_ipc_invoke', {
					command: 'file:stat',
					args: [path]
				});
				const stats = result as any;
				return {
					isFile: !stats.isDirectory,
					isDirectory: stats.isDirectory || false,
					isSymlink: stats.isSymlink || false,
					size: stats.size || 0,
					modified: stats.modified || Date.now(),
					accessed: stats.accessed,
					created: stats.created
				};
			},
			catch: (error) => {
				return new Error(`Failed to stat file ${path}: ${error}`);
			},
		});
	},

	mkdir: (path: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriAvailable()) {
					throw new Error('Tauri not available');
				}

				await invoke('mountain_ipc_invoke', {
					command: 'file:mkdir',
					args: [path, true]
				});
			},
			catch: (error) => {
				return new Error(`Failed to create directory ${path}: ${error}`);
			},
		});
	},

	delete: (path: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriAvailable()) {
					throw new Error('Tauri not available');
				}

				await invoke('mountain_ipc_invoke', {
					command: 'file:delete',
					args: [path]
				});
			},
			catch: (error) => {
				return new Error(`Failed to delete ${path}: ${error}`);
			},
		});
	},

	readdir: (path: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriAvailable()) {
					throw new Error('Tauri not available');
				}

				const result = await invoke('mountain_ipc_invoke', {
					command: 'file:readdir',
					args: [path]
				});
				const entries = result as any[];
				return entries.map(entry => ({
					name: entry.name,
					isFile: !entry.isDirectory,
					isDirectory: entry.isDirectory || false,
					isSymlink: entry.isSymlink || false
				}));
			},
			catch: (error) => {
				return new Error(`Failed to read directory ${path}: ${error}`);
			},
		});
	},

	copy: (source: string, destination: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriAvailable()) {
					throw new Error('Tauri not available');
				}

				await invoke('mountain_ipc_invoke', {
					command: 'file:copy',
					args: [source, destination]
				});
			},
			catch: (error) => {
				return new Error(`Failed to copy ${source} to ${destination}: ${error}`);
			},
		});
	},

	move: (source: string, destination: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriAvailable()) {
					throw new Error('Tauri not available');
				}

				await invoke('mountain_ipc_invoke', {
					command: 'file:move',
					args: [source, destination]
				});
			},
			catch: (error) => {
				return new Error(`Failed to move ${source} to ${destination}: ${error}`);
			},
		});
	},

	watch: (path: string, callback: () => void) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriFsAvailable()) {
					throw new Error('Tauri file system not available');
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedPath = normalizePath(path);

				// Watch implementation
				const unwatch = await fs.watch(normalizedPath, () => {
					try {
						callback();
					} catch (error) {
						console.warn(`[FileService] Watch callback error: ${error}`);
					}
				});

				// Return cleanup function
				return () => {
					if (typeof unwatch === 'function') {
						unwatch();
					}
				};
			},
			catch: (error) => {
				return new Error(`Failed to watch ${path}: ${error}`);
			},
		});
	},

	uriToPath: (uri: string) => {
		return uriToPathImpl(uri);
	},

	pathToUri: (path: string) => {
		return pathToUriImpl(path);
	},

	readBinaryFile: (path: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriAvailable()) {
					throw new Error('Tauri not available');
				}

				const result = await invoke('mountain_ipc_invoke', {
					command: 'file:readBinary',
					args: [path]
				});
				// Convert base64 string to Uint8Array
				const base64 = result as string;
				const binaryString = atob(base64);
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}
				return bytes;
			},
			catch: (error) => {
				return new Error(`Failed to read binary file ${path}: ${error}`);
			},
		});
	},

	writeBinaryFile: (path: string, content: Uint8Array) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriAvailable()) {
					throw new Error('Tauri not available');
				}

				// Convert Uint8Array to base64 string
				const binaryString = String.fromCharCode(...content);
				const base64 = btoa(binaryString);
				
				await invoke('mountain_ipc_invoke', {
					command: 'file:writeBinary',
					args: [path, base64]
				});
			},
			catch: (error) => {
				return new Error(`Failed to write binary file ${path}: ${error}`);
			},
		});
	},

	/**
	 * Check if path is a file
	 */
	isFile: (path: string) => {
		return Effect.flatMap(
			FileServiceTag,
			(service) => service.stat(path)
		).pipe(
			Effect.map((stats) => stats.isFile),
			Effect.catchAll(() => Effect.succeed(false))
		);
	},

	/**
	 * Check if path is a directory
	 */
	isDirectory: (path: string) => {
		return Effect.flatMap(
			FileServiceTag,
			(service) => service.stat(path)
		).pipe(
			Effect.map((stats) => stats.isDirectory),
			Effect.catchAll(() => Effect.succeed(false))
		);
	},

	/**
	 * Get file size
	 */
	getSize: (path: string) => {
		return Effect.flatMap(
			FileServiceTag,
			(service) => service.stat(path)
		).pipe(
			Effect.map((stats) => stats.size),
			Effect.catchAll(() => Effect.succeed(0))
		);
	},
});

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create the file service layer
 * @returns Effect-TS layer for FileService
 */
export function createFileServiceLayer(): Effect.Layer<never> {
	return FileServiceTag.provide(FileServiceImpl);
}

// ============================================================================
// EFFECT-TS WRAPPERS
// ============================================================================

/**
 * Effect wrapper for reading file
 */
export const readFileEffect = (
	path: string
): Effect.Effect<string> => {
	return Effect.flatMap(
		FileServiceTag,
		(service) => service.readFile(path)
	);
};

/**
 * Effect wrapper for writing file
 */
export const writeFileEffect = (
	path: string,
	content: string
): Effect.Effect<void> => {
	return Effect.flatMap(
		FileServiceTag,
		(service) => service.writeFile(path, content)
	);
};

/**
 * Effect wrapper for checking if path exists
 */
export const existsEffect = (
	path: string
): Effect.Effect<boolean> => {
	return Effect.flatMap(
		FileServiceTag,
		(service) => service.exists(path)
	);
};

/**
 * Effect wrapper for getting file stats
 */
export const statEffect = (
	path: string
): Effect.Effect<FileStat> => {
	return Effect.flatMap(
		FileServiceTag,
		(service) => service.stat(path)
	);
};

/**
 * Effect wrapper for creating directory
 */
export const mkdirEffect = (
	path: string
): Effect.Effect<void> => {
	return Effect.flatMap(
		FileServiceTag,
		(service) => service.mkdir(path)
	);
};

/**
 * Effect wrapper for deleting file/directory
 */
export const deleteEffect = (
	path: string
): Effect.Effect<void> => {
	return Effect.flatMap(
		FileServiceTag,
		(service) => service.delete(path)
	);
};

/**
 * Effect wrapper for reading directory
 */
export const readdirEffect = (
	path: string
): Effect.Effect<DirEntry[]> => {
	return Effect.flatMap(
		FileServiceTag,
		(service) => service.readdir(path)
	);
};

/**
 * Effect wrapper for copying file
 */
export const copyEffect = (
	source: string,
	destination: string
): Effect.Effect<void> => {
	return Effect.flatMap(
		FileServiceTag,
		(service) => service.copy(source, destination)
	);
};

/**
 * Effect wrapper for moving file
 */
export const moveEffect = (
	source: string,
	destination: string
): Effect.Effect<void> => {
	return Effect.flatMap(
		FileServiceTag,
		(service) => service.move(source, destination)
	);
};

/**
 * Effect wrapper for watching file/directory
 */
export const watchEffect = (
	path: string,
	callback: () => void
): Effect.Effect<() => void> => {
	return Effect.flatMap(
		FileServiceTag,
		(service) => service.watch(path, callback)
	);
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export default FileServiceTag;
