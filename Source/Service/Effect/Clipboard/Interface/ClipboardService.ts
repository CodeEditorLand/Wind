/**
 * @module Effect/Clipboard/Interface/ClipboardService
 * @description
 * Service interface for clipboard operations. Provides read/write operations
 * for clipboard functionality with comprehensive error handling.
 * @see {@link Effect/Clipboard/Implementation/ClipboardImplementation} Implementation
 * @category Interface
 */

import type { ClipboardProblem } from "../Type/ClipboardProblem.js";

// ============================================================================
// Service Interface
// ============================================================================

/**
 * Clipboard service interface
 * Microsoft VSCode Reference: IClipboardService from vs/platform/clipboard/common/clipboardService.ts
 */
export interface ClipboardService {
	readonly readText: () => string;

	readonly writeText: (text: string) => void;

	readonly readHTML: () => string;

	readonly writeHTML: (
		html: string,

		text: string,
	) => void;

	readonly readImage: () => Blob;

	readonly writeImage: (blob: Blob) => void;

	readonly hasText: () => boolean;

	readonly clear: () => void;
}
