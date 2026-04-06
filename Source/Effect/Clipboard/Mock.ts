/**
 * @module Effect/Clipboard/Mock
 * @description
 * Mock layer for the Clipboard service for testing purposes.
 * Uses in-memory clipboard state without accessing the system clipboard.
 * @see {@link Effect/Clipboard/Implementation/MockClipboard} Implementation
 * @category Layer
 */

import { Layer } from "effect";

import { MockClipboardService } from "./Implementation/MockClipboard.js";
import { ClipboardServiceTag } from "./Tag/ClipboardServiceTag.js";

// ============================================================================
// Mock Layer
// ============================================================================

/**
 * Mock clipboard service layer for testing
 */
export const MockClipboardServiceLayer = Layer.succeed(
	ClipboardServiceTag,
	MockClipboardService,
);

export default MockClipboardServiceLayer;
