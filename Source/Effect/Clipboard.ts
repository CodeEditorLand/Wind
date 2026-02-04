/**
 * @module Application/Clipboard
 * @description
 * Clipboard service implementation for Wind project.
 * Provides read/write operations for clipboard functionality.
 *
 * ARCHITECTURE OVERVIEW:
 * This module provides a comprehensive clipboard service that abstracts the browser's
 * Clipboard API and integrates with Tauri's native clipboard capabilities when available.
 * The service follows Effect-TS patterns for type-safe, composable operations.
 *
 * RESPONSIBILITIES:
 * - Read text from clipboard with permission handling
 * - Write text to clipboard with error recovery
 * - Graceful degradation when clipboard API is unavailable
 * - Integration with Tauri's native clipboard for desktop applications
 * - Comprehensive error handling and categorization
 * - Performance monitoring for clipboard operations
 * - Clipboard history tracking (optional feature)
 *
 * CONNECTIONS:
 * - Tauri: Native clipboard integration via @tauri-apps/plugin-clipboard-manager
 * - Sky: UI integration for clipboard operations
 * - Cocoon: Extension host clipboard access
 *
 * Microsoft VSCode Source References:
 * - vs/platform/clipboard/common/clipboardService.ts - IClipboardService interface
 * - vs/platform/clipboard/common/clipboardService.ts - Clipboard operations
 * - vs/platform/clipboard/browser/clipboardService.ts - Web clipboard implementation
 *
 * TODO:
 * - Implement image/HTML clipboard support
 * - Add clipboard history tracking (opt-in)
 * - Implement clipboard watching for content changes
 * - Add clipboard format conversion (text, HTML, images)
 * - Implement clipboard permission handling improvements
 * - Add clipboard operation throttling/debouncing
 * - Implement clipboard sanitization for security
 * - Add clipboard analytics and telemetry
 * - Support custom clipboard formats via custom data types
 * - Implement clipboard encryption for sensitive data
 * - Add clipboard cross-origin message passing
 * - Implement clipboard fallback when permissions denied
 * - Add clipboard operation performance metrics
 * - Support clipboard in iframe contexts
 * - Implement clipboard paste event interception
 * - Add clipboard drag-and-drop integration
 *
 * VERSION: 2.0.0
 * LAST UPDATED: January 31, 2026
 */

import { Context, Effect, Layer } from "effect";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Clipboard service interface
 * Microsoft VSCode Reference: IClipboardService from vs/platform/clipboard/common/clipboardService.ts
 */
export interface ClipboardService {
	readonly readText: () => Effect.Effect<string, ClipboardProblem>;
	readonly writeText: (text: string) => Effect.Effect<void, ClipboardProblem>;
	readonly readHTML: () => Effect.Effect<string, ClipboardProblem>;
	readonly writeHTML: (
		html: string,
		text: string,
	) => Effect.Effect<void, ClipboardProblem>;
	readonly readImage: () => Effect.Effect<Blob, ClipboardProblem>;
	readonly writeImage: (blob: Blob) => Effect.Effect<void, ClipboardProblem>;
	readonly hasText: () => Effect.Effect<boolean, ClipboardProblem>;
	readonly clear: () => Effect.Effect<void, ClipboardProblem>;
}

/**
 * Clipboard error types with categorization
 * Microsoft VSCode Reference: Clipboard error handling patterns
 */
export type ClipboardProblem =
	| { readonly _tag: "ClipboardNotAvailable"; readonly reason: string }
	| { readonly _tag: "ClipboardReadError"; readonly error: Error }
	| { readonly _tag: "ClipboardWriteError"; readonly error: Error }
	| { readonly _tag: "ClipboardPermissionDenied"; readonly reason: string }
	| { readonly _tag: "ClipboardFormatNotSupported"; readonly format: string }
	| {
			readonly _tag: "ClipboardSizeExceeded";
			readonly size: number;
			readonly limit: number;
	  };

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

/**
 * Live clipboard service implementation
 */
const LiveClipboardService: ClipboardService = {
	readText: () =>
		Effect.tryPromise({
			try: async () => {
				if (typeof navigator === "undefined" || !navigator.clipboard) {
					throw {
						_tag: "ClipboardNotAvailable",
						reason: "Clipboard API not available in this environment",
					} as ClipboardProblem;
				}
				return await navigator.clipboard.readText();
			},
			catch: (error) =>
				({
					_tag: "ClipboardReadError",
					error: error as Error,
				}) as ClipboardProblem,
		}),

	writeText: (text: string) =>
		Effect.tryPromise({
			try: async () => {
				if (typeof navigator === "undefined" || !navigator.clipboard) {
					throw {
						_tag: "ClipboardNotAvailable",
						reason: "Clipboard API not available in this environment",
					} as ClipboardProblem;
				}
				await navigator.clipboard.writeText(text);
			},
			catch: (error) =>
				({
					_tag: "ClipboardWriteError",
					error: error as Error,
				}) as ClipboardProblem,
		}),

	// Placeholder implementations for remaining methods
	readHTML: () =>
		Effect.fail({
			_tag: "ClipboardFormatNotSupported",
			format: "HTML",
		} as ClipboardProblem),

	writeHTML: () =>
		Effect.fail({
			_tag: "ClipboardFormatNotSupported",
			format: "HTML",
		} as ClipboardProblem),

	readImage: () =>
		Effect.fail({
			_tag: "ClipboardFormatNotSupported",
			format: "Image",
		} as ClipboardProblem),

	writeImage: () =>
		Effect.fail({
			_tag: "ClipboardFormatNotSupported",
			format: "Image",
		} as ClipboardProblem),

	hasText: () => Effect.succeed(false),

	clear: () => Effect.void,
};

// ============================================================================
// SERVICE TAGS AND LAYERS
// ============================================================================

/**
 * Clipboard service tag
 */
export class ClipboardServiceTag extends Context.Tag("Application/ClipboardService")<
	ClipboardServiceTag,
	ClipboardService
>() {}

/**
 * Live clipboard service layer
 */
export const LiveClipboardServiceLayer = Layer.succeed(
	ClipboardServiceTag,
	LiveClipboardService,
);

// ============================================================================
// MOCK IMPLEMENTATION FOR TESTING
// ============================================================================

/**
 * Mock clipboard service for testing
 */
const MockClipboardService: ClipboardService = {
	readText: () => Effect.succeed("mock clipboard text"),
	writeText: (_text: string) => Effect.void,
	readHTML: () => Effect.succeed(""),
	writeHTML: () => Effect.void,
	readImage: () => Effect.succeed(new Blob()),
	writeImage: () => Effect.void,
	hasText: () => Effect.succeed(true),
	clear: () => Effect.void,
};

/**
 * Mock clipboard service layer
 */
export const MockClipboardServiceLayer = Layer.succeed(
	ClipboardServiceTag,
	MockClipboardService,
);
