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

export const FileServiceTag = Effect.Context.Tag<FileService, FileService>(
	'FileService'
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if Tauri fs plugin is available
 */
function isTauriFsAvailable(): boolean {
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
				if (!isTauriFsAvailable()) {
					throw new Error('Tauri file system not available');
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedPath = normalizePath(path);
				return await fs.readTextFile(normalizedPath);
			},
			catch: (error) => {
				return new Error(`Failed to read file ${path}: ${error}`);
			},
		});
	},

	writeFile: (path: string, content: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriFsAvailable()) {
					throw new Error('Tauri file system not available');
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedPath = normalizePath(path);
				await fs.writeTextFile(normalizedPath, content, {
					create: true,
					append: false,
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
				if (!isTauriFsAvailable()) {
					return false;
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedPath = normalizePath(path);
				return await fs.exists(normalizedPath);
			},
			catch: () => {
				return false;
			},
		});
	},

	stat: (path: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriFsAvailable()) {
					throw new Error('Tauri file system not available');
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedPath = normalizePath(path);
				const stats = await fs.stat(normalizedPath);
				return convertTauriStats(stats);
			},
			catch: (error) => {
				return new Error(`Failed to stat file ${path}: ${error}`);
			},
		});
	},

	mkdir: (path: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriFsAvailable()) {
					throw new Error('Tauri file system not available');
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedPath = normalizePath(path);
				await fs.mkdir(normalizedPath, { recursive: true });
			},
			catch: (error) => {
				return new Error(`Failed to create directory ${path}: ${error}`);
			},
		});
	},

	delete: (path: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriFsAvailable()) {
					throw new Error('Tauri file system not available');
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedPath = normalizePath(path);
				await fs.remove(normalizedPath, { recursive: true });
			},
			catch: (error) => {
				return new Error(`Failed to delete ${path}: ${error}`);
			},
		});
	},

	readdir: (path: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriFsAvailable()) {
					throw new Error('Tauri file system not available');
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedPath = normalizePath(path);

				// Try newer API first
				if ('readDir' in fs && typeof fs.readDir === 'function') {
					const entries = await fs.readDir(normalizedPath);
					return entries.map(convertTauriDirEntry);
				}

				// Fallback to older API
				if ('readdir' in fs && typeof fs.readdir === 'function') {
					const entries = await fs.readdir(normalizedPath);
					return entries.map(convertTauriDirEntry);
				}

				throw new Error('No suitable directory reading method available');
			},
			catch: (error) => {
				return new Error(`Failed to read directory ${path}: ${error}`);
			},
		});
	},

	copy: (source: string, destination: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriFsAvailable()) {
					throw new Error('Tauri file system not available');
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedSource = normalizePath(source);
				const normalizedDest = normalizePath(destination);

				// Try copyFile (newer API)
				if ('copyFile' in fs && typeof fs.copyFile === 'function') {
					await fs.copyFile(normalizedSource, normalizedDest);
					return;
				}

				// Fallback: read and write
				const content = await fs.readTextFile(normalizedSource);
				await fs.writeTextFile(normalizedDest, content, { create: true });
			},
			catch: (error) => {
				return new Error(`Failed to copy ${source} to ${destination}: ${error}`);
			},
		});
	},

	move: (source: string, destination: string) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriFsAvailable()) {
					throw new Error('Tauri file system not available');
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedSource = normalizePath(source);
				const normalizedDest = normalizePath(destination);

				// Try rename (newer API)
				if ('rename' in fs && typeof fs.rename === 'function') {
					await fs.rename(normalizedSource, normalizedDest);
					return;
				}

				throw new Error('No suitable move/rename method available');
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
				if (!isTauriFsAvailable()) {
					throw new Error('Tauri file system not available');
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedPath = normalizePath(path);
				return await fs.readFile(normalizedPath);
			},
			catch: (error) => {
				return new Error(`Failed to read binary file ${path}: ${error}`);
			},
		});
	},

	writeBinaryFile: (path: string, content: Uint8Array) => {
		return Effect.tryPromise({
			try: async () => {
				if (!isTauriFsAvailable()) {
					throw new Error('Tauri file system not available');
				}

				const fs = await import('@tauri-apps/plugin-fs');
				const normalizedPath = normalizePath(path);
				await fs.writeFile(normalizedPath, content, {
					create: true,
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
