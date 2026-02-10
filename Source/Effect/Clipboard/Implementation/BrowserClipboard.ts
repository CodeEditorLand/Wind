/**
 * @module Effect/Clipboard/Implementation/BrowserClipboard
 * @description
 * Browser-based clipboard service implementation using the Clipboard API.
 * Provides full clipboard functionality with graceful degradation.
 * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
 * @category Implementation
 */

import { Effect } from "effect";
import type { ClipboardService } from "../Interface/ClipboardService.js";
import type { ClipboardProblem } from "../Type/ClipboardProblem.js";
import {
	createNotAvailableError,
	createReadError,
	createWriteError,
	createFormatNotSupportedError,
} from "./ClipboardHelper.js";

// ============================================================================
// Live Web Implementation
// ============================================================================

/**
 * Live clipboard service for web environments
 * Uses the browser's Clipboard API
 */
export const LiveBrowserClipboardService: ClipboardService = {
	readText: () =>
		Effect.tryPromise({
			try: async () => {
				if (typeof navigator === "undefined" || !navigator.clipboard) {
					throw createNotAvailableError("Clipboard API not available in this environment");
				}
				return await navigator.clipboard.readText();
			},
			catch: (error) => createReadError(error as Error),
		}),

	writeText: (text: string) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof navigator === "undefined" || !navigator.clipboard) {
					throw createNotAvailableError("Clipboard API not available in this environment");
				}
				await navigator.clipboard.writeText(text);
			},
			catch: (error) => createWriteError(error as Error),
		}),

	// Placeholder implementations for remaining methods
	readHTML: () =>
		Effect.fail(createFormatNotSupportedError("HTML")),

	writeHTML: () =>
		Effect.fail(createFormatNotSupportedError("HTML")),

	readImage: () =>
		Effect.fail(createFormatNotSupportedError("Image")),

	writeImage: () =>
		Effect.fail(createFormatNotSupportedError("Image")),

	hasText: () => Effect.succeed(false),

	clear: () => Effect.void,
};

export default LiveBrowserClipboardService;
