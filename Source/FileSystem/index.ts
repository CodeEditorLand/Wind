/**
 * @module FileSystem
 * @description
 * FileSystemProvider service for VSCode-like file system operations.
 * Provides access to Mountain's file system through Tauri IPC.
 * @category Service
 */

// ============================================================================
// Service
// ============================================================================

export { default as FileSystemProvider } from "./Implementation/FileSystemProviderImplementation.js";

// ============================================================================
// Tags
// ============================================================================

export { FileSystemProviderTag } from "./Implementation/FileSystemProviderImplementation.js";

// ============================================================================
// Layers
// ============================================================================

export {
	FileSystemProviderLive,
	MountainCommands,
} from "./Implementation/FileSystemProviderImplementation.js";

// ============================================================================
// Interface
// ============================================================================

export type { FileSystemProviderService } from "./Interface/FileSystemProvider.js";

// ============================================================================
// Types
// ============================================================================

export type {
	IDisposable,
	IFileSystemProvider,
	IFileWriteOptions,
	IStat,
	IWatchOptions,
} from "./Type/FileSystemType.js";

export { FileSystemErrorCode } from "./Type/FileSystemType.js";

export { FileType } from "./Type/FileType.js";

export { URI } from "./Type/URI.js";

// ============================================================================
// Errors
// ============================================================================

export {
	FileExistsError,
	FileNotFoundError,
	FileSystemProviderError,
	InvalidPathError,
	isFileExistsError,
	isFileNotFoundError,
	isFileSystemProviderError,
	isInvalidPathError,
	isNotSupportedError,
	isPermissionError,
	isUnknownFileSystemError,
	NotSupportedError,
	PermissionError,
	toFileSystemProviderError,
	UnknownFileSystemError,
} from "./Error/FileSystemProviderError.js";
