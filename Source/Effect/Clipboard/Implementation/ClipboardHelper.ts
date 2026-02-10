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
export const createNotAvailableError = (reason: string): ClipboardProblem => ({
	_tag: "ClipboardNotAvailable",
	reason,
});

/**
 * Create a "ClipboardReadError" error
 * @param error - The underlying error
 * @returns A ClipboardProblem instance
 */
export const createReadError = (error: Error): ClipboardProblem => ({
	_tag: "ClipboardReadError",
	error,
});

/**
 * Create a "ClipboardWriteError" error
 * @param error - The underlying error
 * @returns A ClipboardProblem instance
 */
export const createWriteError = (error: Error): ClipboardProblem => ({
	_tag: "ClipboardWriteError",
	error,
});

/**
 * Create a "ClipboardPermissionDenied" error
 * @param reason - The reason for permission denial
 * @returns A ClipboardProblem instance
 */
export const createPermissionDeniedError = (reason: string): ClipboardProblem => ({
	_tag: "ClipboardPermissionDenied",
	reason,
});

/**
 * Create a "ClipboardFormatNotSupported" error
 * @param format - The unsupported format
 * @returns A ClipboardProblem instance
 */
export const createFormatNotSupportedError = (format: string): ClipboardProblem => ({
	_tag: "ClipboardFormatNotSupported",
	format,
});

/**
 * Create a "ClipboardSizeExceeded" error
 * @param size - The size that was attempted
 * @param limit - The size limit
 * @returns A ClipboardProblem instance
 */
export const createSizeExceededError = (size: number, limit: number): ClipboardProblem => ({
	_tag: "ClipboardSizeExceeded",
	size,
	limit,
});

const helpers = {
	createNotAvailableError,
	createReadError,
	createWriteError,
	createPermissionDeniedError,
	createFormatNotSupportedError,
	createSizeExceededError,
};

export default helpers;
