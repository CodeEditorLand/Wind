/**
 * @module Effect/Clipboard/Implementation/ClipboardHelper
 * @description
 * Helper functions for creating clipboard error instances.
 * Used by the clipboard service implementations.
 * @see {@link Effect/Clipboard/Implementation/ClipboardImplementation} Main implementation
 * @category Implementation
 */

import type { ClipboardProblem } from "../Type/ClipboardProblem.js";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a "ClipboardNotAvailable" error
 * @param reason - The reason why clipboard is not available
 * @returns A ClipboardProblem instance
 */
export const CreateNotAvailableError = (Reason: string): ClipboardProblem => ({
	_tag: "ClipboardNotAvailable",
	reason: Reason,
});

/**
 * Create a "ClipboardReadError" error
 * @param error - The underlying error
 * @returns A ClipboardProblem instance
 */
export const CreateReadError = (Error: Error): ClipboardProblem => ({
	_tag: "ClipboardReadError",
	error: Error,
});

/**
 * Create a "ClipboardWriteError" error
 * @param error - The underlying error
 * @returns A ClipboardProblem instance
 */
export const CreateWriteError = (Error: Error): ClipboardProblem => ({
	_tag: "ClipboardWriteError",
	error: Error,
});

/**
 * Create a "ClipboardPermissionDenied" error
 * @param reason - The reason for permission denial
 * @returns A ClipboardProblem instance
 */
export const CreatePermissionDeniedError = (
	Reason: string,
): ClipboardProblem => ({
	_tag: "ClipboardPermissionDenied",
	reason: Reason,
});

/**
 * Create a "ClipboardFormatNotSupported" error
 * @param format - The unsupported format
 * @returns A ClipboardProblem instance
 */
export const CreateFormatNotSupportedError = (
	Format: string,
): ClipboardProblem => ({
	_tag: "ClipboardFormatNotSupported",
	format: Format,
});

/**
 * Create a "ClipboardSizeExceeded" error
 * @param size - The size that was attempted
 * @param limit - The size limit
 * @returns A ClipboardProblem instance
 */
export const CreateSizeExceededError = (
	Size: number,

	Limit: number,
): ClipboardProblem => ({
	_tag: "ClipboardSizeExceeded",
	size: Size,
	limit: Limit,
});

const helpers = {
	CreateNotAvailableError,

	CreateReadError,

	CreateWriteError,

	CreatePermissionDeniedError,

	CreateFormatNotSupportedError,

	CreateSizeExceededError,
};

export default helpers;
