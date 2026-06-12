/**
 * @module Effect/Clipboard/Implementation/MockClipboard
 * @description
 * Mock clipboard service for testing purposes.
 * Provides in-memory clipboard state without accessing the system clipboard.
 * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
 * @category Implementation
 */

import { Effect } from "effect";

import type { ClipboardService } from "../Interface/ClipboardService.js";

// ============================================================================
// Mock Implementation for Testing
// ============================================================================

/**
 * Mock clipboard service for testing
 * Provides a simple in-memory clipboard state
 */
export const MockClipboardService: ClipboardService = {
	readText: () => Effect.succeed("mock clipboard text"),

	writeText: (_text: string) => Effect.void,

	readHTML: () => Effect.succeed(""),

	writeHTML: () => Effect.void,

	readImage: () => Effect.succeed(new Blob()),

	writeImage: () => Effect.void,

	hasText: () => Effect.succeed(true),

	clear: () => Effect.void,
};

export default MockClipboardService;
