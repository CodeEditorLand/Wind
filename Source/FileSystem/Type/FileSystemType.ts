/**
 * @module FileSystem/Type/FileSystemType
 * @description
 * Type definitions for file system operations matching VSCode's IFileSystemProvider interface.
 * @category Type
 */

import type { FileType } from "./FileType.js";
import type { URI } from "./URI.js";

// ============================================================================
// File Metadata Types
// ============================================================================

// IStat matches VS Code's IStat exactly - re-export directly.
import type { IStat } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/platform/files/common/files.js";
export type { IStat };

// ============================================================================
// File Write Options
// ============================================================================

/**
 * Options for writing to files
 */
export interface IFileWriteOptions {
	/** If true, create the file if it doesn't exist */
	readonly create: boolean;

	/** If true, overwrite existing file */
	readonly overwrite: boolean;
}

// ============================================================================
// Watch Options
// ============================================================================

/**
 * Options for watching file/directory changes
 */
export interface IWatchOptions {
	/** Whether to watch recursively (for directories) */
	readonly recursive: boolean;

	/** Whether to watch for file creation */
	readonly exclusive?: boolean;
}

// ============================================================================
// Disposable
// ============================================================================

/**
 * Disposable resource (e.g., file watcher)
 */
export interface IDisposable {
	/** Dispose of the resource */
	readonly dispose: () => void | Promise<void>;
}

// ============================================================================
// File System Provider Interface
// ============================================================================

/**
 * VSCode-like file system provider interface
 * Provides methods for file and directory operations
 */
export interface IFileSystemProvider {
	// ============================================================================
	// File Operations
	// ============================================================================

	/**
	 * Read file contents as binary data
	 * @param uri - URI of the file to read
	 * @returns Promise resolving to file contents as Uint8Array
	 */
	readFile: (uri: URI) => Promise<Uint8Array>;

	/**
	 * Write data to a file
	 * @param uri - URI of the file to write
	 * @param content - File content as Uint8Array
	 * @param options - Write options (create, overwrite)
	 * @returns Promise that resolves when write is complete
	 */
	writeFile: (
		uri: URI,

		content: Uint8Array,

		options?: IFileWriteOptions,
	) => Promise<void>;

	/**
	 * Delete a file or directory
	 * @param uri - URI of the file/directory to delete
	 * @returns Promise that resolves when deletion is complete
	 */
	delete: (uri: URI) => Promise<void>;

	/**
	 * Copy a file or directory
	 * @param source - Source URI
	 * @param destination - Destination URI
	 * @returns Promise that resolves when copy is complete
	 */
	copy: (source: URI, destination: URI) => Promise<void>;

	/**
	 * Move/rename a file or directory
	 * @param source - Source URI
	 * @param destination - Destination URI
	 * @returns Promise that resolves when move is complete
	 */
	move: (source: URI, destination: URI) => Promise<void>;

	// ============================================================================
	// Directory Operations
	// ============================================================================

	/**
	 * List directory contents
	 * @param uri - URI of the directory to read
	 * @returns Promise resolving to array of [name, FileType] tuples
	 */
	readdir: (uri: URI) => Promise<[string, FileType][]>;

	/**
	 * Create a directory
	 * @param uri - URI of the directory to create
	 * @param options - Options (e.g., recursive creation)
	 * @returns Promise that resolves when directory is created
	 */
	mkdir: (uri: URI, options?: { recursive: boolean }) => Promise<void>;

	/**
	 * Remove a directory
	 * @param uri - URI of the directory to remove
	 * @returns Promise that resolves when directory is removed
	 */
	rmdir: (uri: URI) => Promise<void>;

	// ============================================================================
	// Metadata Operations
	// ============================================================================

	/**
	 * Get file/directory statistics
	 * @param uri - URI of the file/directory to stat
	 * @returns Promise resolving to file statistics
	 */
	stat: (uri: URI) => Promise<IStat>;

	// ============================================================================
	// Watching (Optional)
	// ============================================================================

	/**
	 * Watch file/directory for changes
	 * @param uri - URI to watch
	 * @param options - Watch options
	 * @returns Disposable for stopping the watch
	 */
	watch?: (uri: URI, options: IWatchOptions) => IDisposable;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base error type for file system operations
 */
export class FileSystemError extends Error {
	constructor(
		message: string,

		public readonly code: FileSystemErrorCode,
	) {
		super(message);

		this.name = "FileSystemError";
	}
}

/**
 * Error codes for file system operations
 */
export enum FileSystemErrorCode {
	/** File not found */
	FileNotFound = "FileNotFound",

	/** File already exists */
	FileExists = "FileExists",

	/** Permission denied */
	NoPermissions = "NoPermissions",

	/** Invalid file path or URI */
	InvalidPath = "InvalidPath",

	/** Operation not supported */
	NotSupported = "NotSupported",

	/** Unknown error */
	Unknown = "Unknown",
}
