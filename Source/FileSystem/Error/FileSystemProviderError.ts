/**
 * @module FileSystem/Error/FileSystemProviderError
 * @description
 * Error types for FileSystemProvider operations.
 * @category Error
 */

import { FileSystemErrorCode } from "../Type/FileSystemType.js";

// ============================================================================
// Error Base Class
// ============================================================================

/**
 * Base error class for file system provider operations
 */
export class FileSystemProviderError extends Error {
	_tag: string;
	readonly code: FileSystemErrorCode;

	constructor(message: string, code: FileSystemErrorCode, cause?: unknown) {
		super(message, cause ? { cause } : undefined);
		this.name = "FileSystemProviderError";
		this._tag = "FileSystemProviderError";
		this.code = code;
	}
}

/**
 * File not found error
 */
export class FileNotFoundError extends FileSystemProviderError {
	constructor(path: string, cause?: unknown) {
		super(
			`File not found: ${path}`,
			FileSystemErrorCode.FileNotFound,
			cause,
		);
		this.name = "FileNotFoundError";
		this._tag = "FileNotFoundError";
	}
}

/**
 * File exists error
 */
export class FileExistsError extends FileSystemProviderError {
	constructor(path: string, cause?: unknown) {
		super(
			`File already exists: ${path}`,
			FileSystemErrorCode.FileExists,
			cause,
		);
		this.name = "FileExistsError";
		this._tag = "FileExistsError";
	}
}

/**
 * Permission error
 */
export class PermissionError extends FileSystemProviderError {
	constructor(path: string, cause?: unknown) {
		super(
			`Permission denied: ${path}`,
			FileSystemErrorCode.NoPermissions,
			cause,
		);
		this.name = "PermissionError";
		this._tag = "PermissionError";
	}
}

/**
 * Invalid path error
 */
export class InvalidPathError extends FileSystemProviderError {
	constructor(path: string, cause?: unknown) {
		super(`Invalid path: ${path}`, FileSystemErrorCode.InvalidPath, cause);
		this.name = "InvalidPathError";
		this._tag = "InvalidPathError";
	}
}

/**
 * Not supported error
 */
export class NotSupportedError extends FileSystemProviderError {
	constructor(operation: string, cause?: unknown) {
		super(
			`Operation not supported: ${operation}`,
			FileSystemErrorCode.NotSupported,
			cause,
		);
		this.name = "NotSupportedError";
		this._tag = "NotSupportedError";
	}
}

/**
 * Unknown file system error
 */
export class UnknownFileSystemError extends FileSystemProviderError {
	constructor(message: string, cause?: unknown) {
		super(
			`Unknown file system error: ${message}`,
			FileSystemErrorCode.Unknown,
			cause,
		);
		this.name = "UnknownFileSystemError";
		this._tag = "UnknownFileSystemError";
	}
}

// ============================================================================
// Type Guard Helpers
// ============================================================================

/**
 * Check if an error is a FileSystemProviderError
 */
export function isFileSystemProviderError(
	error: unknown,
): error is FileSystemProviderError {
	return error instanceof FileSystemProviderError;
}

/**
 * Check if an error is a FileNotFoundError
 */
export function isFileNotFoundError(
	error: unknown,
): error is FileNotFoundError {
	return error instanceof FileNotFoundError;
}

/**
 * Check if an error is a FileExistsError
 */
export function isFileExistsError(error: unknown): error is FileExistsError {
	return error instanceof FileExistsError;
}

/**
 * Check if an error is a PermissionError
 */
export function isPermissionError(error: unknown): error is PermissionError {
	return error instanceof PermissionError;
}

/**
 * Check if an error is an InvalidPathError
 */
export function isInvalidPathError(error: unknown): error is InvalidPathError {
	return error instanceof InvalidPathError;
}

/**
 * Check if an error is a NotSupportedError
 */
export function isNotSupportedError(
	error: unknown,
): error is NotSupportedError {
	return error instanceof NotSupportedError;
}

/**
 * Check if an error is an UnknownFileSystemError
 */
export function isUnknownFileSystemError(
	error: unknown,
): error is UnknownFileSystemError {
	return error instanceof UnknownFileSystemError;
}

// ============================================================================
// Error Conversion Helpers
// ============================================================================

/**
 * Convert a generic error to a FileSystemProviderError
 * @param error - Error to convert
 * @param context - Additional context (e.g., path, operation)
 * @param contextValue - Specific context value (e.g., actual path)
 * @returns FileSystemProviderError
 */
export function toFileSystemProviderError(
	error: unknown,
	context: string,
	contextValue?: string,
): FileSystemProviderError {
	// Check if it's already a FileSystemProviderError
	if (isFileSystemProviderError(error)) {
		return error;
	}

	const message = error instanceof Error ? error.message : String(error);
	const fullMessage = contextValue
		? `${context} (${contextValue}): ${message}`
		: `${context}: ${message}`;

	// Try to infer error type from message
	const lowerMessage = message.toLowerCase();
	if (
		lowerMessage.includes("not found") ||
		lowerMessage.includes("no such")
	) {
		return new FileNotFoundError(contextValue ?? context, error);
	}
	if (
		lowerMessage.includes("already exists") ||
		lowerMessage.includes("exists")
	) {
		return new FileExistsError(contextValue ?? context, error);
	}
	if (
		lowerMessage.includes("permission") ||
		lowerMessage.includes("denied")
	) {
		return new PermissionError(contextValue ?? context, error);
	}
	if (
		lowerMessage.includes("invalid") ||
		lowerMessage.includes("malformed")
	) {
		return new InvalidPathError(contextValue ?? context, error);
	}

	return new UnknownFileSystemError(fullMessage, error);
}
