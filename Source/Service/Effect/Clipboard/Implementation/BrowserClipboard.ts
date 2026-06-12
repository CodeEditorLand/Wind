/**
 * @module Effect/Clipboard/Implementation/BrowserClipboard
 * @description
 * Browser-based clipboard service implementation using the Clipboard API.
 * Provides full clipboard functionality with graceful degradation.
 * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
 * @category Implementation
 */

import type { ClipboardService } from "../Interface/ClipboardService.js";
import {
	CreateFormatNotSupportedError,
	CreateNotAvailableError,
	CreateReadError,
	CreateWriteError,
} from "./ClipboardHelper.js";

// ============================================================================
// Live Web Implementation
// ============================================================================

/**
 * Live clipboard service for web environments
 * Uses the browser's Clipboard API
 */
export const LiveBrowserClipboardService: ClipboardService = {
	readText: () => {
		if (typeof navigator === "undefined" || !navigator.clipboard) {
			throw CreateNotAvailableError(
				"Clipboard API not available in this environment",
			);
		}

		throw CreateReadError(
			new Error("readText is async — use LiveBrowserClipboardAsync"),
		);
	},

	writeText: (text: string) => {
		if (typeof navigator === "undefined" || !navigator.clipboard) {
			throw CreateNotAvailableError(
				"Clipboard API not available in this environment",
			);
		}

		void navigator.clipboard.writeText(text).catch((error) => {
			throw CreateWriteError(error as Error);
		});
	},

	// Placeholder implementations for remaining methods
	readHTML: () => {
		throw CreateFormatNotSupportedError("HTML");
	},

	writeHTML: () => {
		throw CreateFormatNotSupportedError("HTML");
	},

	readImage: () => {
		throw CreateFormatNotSupportedError("Image");
	},

	writeImage: () => {
		throw CreateFormatNotSupportedError("Image");
	},

	hasText: () => false,

	clear: () => {},
};

export default LiveBrowserClipboardService;
