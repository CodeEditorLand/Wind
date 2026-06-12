/**
 * @module Effect/Clipboard/Implementation/MockClipboard
 * @description
 * Mock clipboard service for testing purposes.
 * Provides in-memory clipboard state without accessing the system clipboard.
 * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
 * @category Implementation
 */

import type { ClipboardService } from "../Interface/ClipboardService.js";

// ============================================================================
// Mock Implementation for Testing
// ============================================================================

/**
 * Mock clipboard service for testing
 * Provides a simple in-memory clipboard state
 */
export const MockClipboardService: ClipboardService = {
	readText: () => "mock clipboard text",

	writeText: (_text: string) => {},

	readHTML: () => "",

	writeHTML: () => {},

	readImage: () => new Blob(),

	writeImage: () => {},

	hasText: () => true,

	clear: () => {},
};

export default MockClipboardService;
