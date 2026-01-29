/**
 * @module Application/Clipboard
 * @description
 * Clipboard service implementation for Wind project.
 * Provides read/write operations for clipboard functionality.
 */

import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Clipboard service interface
 */
export interface ClipboardService {
  readonly readText: () => Effect.Effect<string, ClipboardError>;
  readonly writeText: (text: string) => Effect.Effect<void, ClipboardError>;
}

/**
 * Clipboard error types
 */
export type ClipboardError =
  | { _tag: "ClipboardNotAvailable"; reason: string }
  | { _tag: "ClipboardReadError"; error: Error }
  | { _tag: "ClipboardWriteError"; error: Error };

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
          return Effect.fail({
            _tag: "ClipboardNotAvailable",
            reason: "Clipboard API not available in this environment"
          } as ClipboardError);
        }
        return await navigator.clipboard.readText();
      },
      catch: (error) => ({
        _tag: "ClipboardReadError",
        error: error as Error
      } as ClipboardError)
    }),

  writeText: (text: string) =>
    Effect.tryPromise({
      try: async () => {
        if (typeof navigator === "undefined" || !navigator.clipboard) {
          return Effect.fail({
            _tag: "ClipboardNotAvailable",
            reason: "Clipboard API not available in this environment"
          } as ClipboardError);
        }
        await navigator.clipboard.writeText(text);
      },
      catch: (error) => ({
        _tag: "ClipboardWriteError",
        error: error as Error
      } as ClipboardError)
    })
};

// ============================================================================
// SERVICE TAGS AND LAYERS
// ============================================================================

/**
 * Clipboard service tag
 */
export const ClipboardServiceTag = Effect.Tag<ClipboardService, ClipboardService>(
  "Application/ClipboardService"
);

/**
 * Live clipboard service layer
 */
export const LiveClipboardServiceLayer = Layer.succeed(
  ClipboardServiceTag,
  LiveClipboardService
);

// ============================================================================
// MOCK IMPLEMENTATION FOR TESTING
// ============================================================================

/**
 * Mock clipboard service for testing
 */
const MockClipboardService: ClipboardService = {
  readText: () => Effect.succeed("mock clipboard text"),
  writeText: (text: string) => Effect.sync(() => {
    console.log(`Mock clipboard write: ${text}`);
  })
};

/**
 * Mock clipboard service layer
 */
export const MockClipboardServiceLayer = Layer.succeed(
  ClipboardServiceTag,
  MockClipboardService
);
