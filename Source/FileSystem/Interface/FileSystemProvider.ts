/**
 * @module FileSystem/Interface/FileSystemProvider
 * @description
 * Interface for the FileSystemProvider service.
 * All operations are plain async; failures throw `FileSystemProviderError`
 * subclasses (the error classes carry the VS Code `name` contract).
 * @see {@link FileSystem/Implementation/FileSystemProviderImplementation} Default implementation
 * @category Interface
 */

import type { IFileSystemProvider } from "../Type/FileSystemType.js";

// ============================================================================
// Service Interface
// ============================================================================

/**
 * Service interface for FileSystemProvider operations.
 * Provides methods for file system operations via Tauri IPC to Mountain.
 */
export interface FileSystemProviderService {
	/**
	 * The underlying IFileSystemProvider (URI-object API).
	 */
	readonly provider: IFileSystemProvider;

	/**
	 * Read file contents as binary data
	 * @param uri - URI of the file to read
	 * @returns Promise resolving to file contents as Uint8Array
	 * @throws FileSystemProviderError
	 */
	readonly readFile: (uri: string) => Promise<Uint8Array>;

	/**
	 * Write data to a file
	 * @param uri - URI of the file to write
	 * @param content - File content as Uint8Array
	 * @param options - Write options (create, overwrite)
	 * @returns Promise that resolves when write is complete
	 * @throws FileSystemProviderError
	 */
	readonly writeFile: (
		uri: string,

		content: Uint8Array,

		options?: { create?: boolean; overwrite?: boolean },
	) => Promise<void>;

	/**
	 * Delete a file or directory
	 * @param uri - URI of the file/directory to delete
	 * @returns Promise that resolves when deletion is complete
	 * @throws FileSystemProviderError
	 */
	readonly delete: (uri: string) => Promise<void>;

	/**
	 * Copy a file or directory
	 * @param source - Source URI
	 * @param destination - Destination URI
	 * @returns Promise that resolves when copy is complete
	 * @throws FileSystemProviderError
	 */
	readonly copy: (source: string, destination: string) => Promise<void>;

	/**
	 * Move/rename a file or directory
	 * @param source - Source URI
	 * @param destination - Destination URI
	 * @returns Promise that resolves when move is complete
	 * @throws FileSystemProviderError
	 */
	readonly move: (source: string, destination: string) => Promise<void>;

	/**
	 * List directory contents
	 * @param uri - URI of the directory to read
	 * @returns Promise resolving to array of [name, FileType] tuples
	 * @throws FileSystemProviderError
	 */
	readonly readdir: (uri: string) => Promise<[string, number][]>;

	/**
	 * Create a directory
	 * @param uri - URI of the directory to create
	 * @param options - Options (e.g., recursive creation)
	 * @returns Promise that resolves when directory is created
	 * @throws FileSystemProviderError
	 */
	readonly mkdir: (
		uri: string,

		options?: { recursive?: boolean },
	) => Promise<void>;

	/**
	 * Remove a directory
	 * @param uri - URI of the directory to remove
	 * @returns Promise that resolves when directory is removed
	 * @throws FileSystemProviderError
	 */
	readonly rmdir: (uri: string) => Promise<void>;

	/**
	 * Get file/directory statistics
	 * @param uri - URI of the file/directory to stat
	 * @returns Promise resolving to file statistics
	 * @throws FileSystemProviderError
	 */
	readonly stat: (uri: string) => Promise<{
		type: number;

		size: number;

		ctime: number;

		mtime: number;

		permissions?: number;
	}>;
}
