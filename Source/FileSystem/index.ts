/**
 * @module FileSystem
 * @description
 * FileSystemProvider service for VSCode-like file system operations.
 * Provides access to Mountain's file system through Tauri IPC.
 * @category Service
 */

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
	IStat,
	IFileWriteOptions,
	IWatchOptions,
	IDisposable,
	IFileSystemProvider,
} from "./Type/FileSystemType.js";

export { FileType, fileTypeToString } from "./Type/FileType.js";

export { URI } from "./Type/URI.js";

export { FileSystemErrorCode } from "./Type/FileSystemType.js";

// ============================================================================
// Errors
// ============================================================================

export {
	FileSystemProviderError,
	FileNotFoundError,
	FileExistsError,
	PermissionError,
	InvalidPathError,
	NotSupportedError,
	UnknownFileSystemError,
	toFileSystemProviderError,
	isFileSystemProviderError,
	isFileNotFoundError,
	isFileExistsError,
	isPermissionError,
	isInvalidPathError,
	isNotSupportedError,
	isUnknownFileSystemError,
} from "./Error/FileSystemProviderError.js";
