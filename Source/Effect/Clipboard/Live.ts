/**
 * @module Effect/Clipboard/Live
 * @description
 * Live layer for the Clipboard service using the browser's Clipboard API.
 * @see {@link Effect/Clipboard/Implementation/BrowserClipboard} Implementation
 * @category Layer
 */

import { Layer } from "effect";

import { LiveBrowserClipboardService } from "./Implementation/BrowserClipboard.js";
import { ClipboardServiceTag } from "./Tag/ClipboardServiceTag.js";

// ============================================================================
// Live Layer
// ============================================================================

/**
 * Live clipboard service layer
 * Uses the browser's Clipboard API
 */
export const LiveClipboardServiceLayer = Layer.succeed(
	ClipboardServiceTag,
	LiveBrowserClipboardService,
);

export default LiveClipboardServiceLayer;
