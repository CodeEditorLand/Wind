/**
 * @module Effect/Clipboard
 * @description
 * Clipboard service implementation for Wind project.
 * Provides read/write operations for clipboard functionality with typed effects.
 * 
 * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
 * @see {@link Effect/Clipboard/Implementation/BrowserClipboard} Live implementation
 * @see {@link Effect/Clipboard/Tag/ClipboardServiceTag} Service tag
 * @category Service
 * @example
 * ```typescript
 * import LiveClipboard from "./Effect/Clipboard/Live.js";
 * import { Clipboard } from "./Effect/Clipboard/Clipboard.ts";
 * import { Effect } from "effect";
 * 
 * const program = Effect.gen(function* () {
 *   const clipboard = yield* Clipboard;
 *   yield* clipboard.writeText("Hello, World!");
 *   const text = yield* clipboard.readText();
 *   return text;
 * });
 * 
 * Effect.runPromise(program.pipe(Effect.provide(LiveClipboard)));
 * ```
 */

// ============================================================================
// Re-exports from atomic modules
// ============================================================================

// Types
export type { ClipboardProblem } from "./Type/ClipboardProblem.js";

// Interface
export type { ClipboardService } from "./Interface/ClipboardService.js";

// Tag
export { ClipboardServiceTag, Clipboard } from "./Tag/ClipboardServiceTag.js";

// Implementations
export { LiveBrowserClipboardService } from "./Implementation/BrowserClipboard.js";
export { MockClipboardService } from "./Implementation/MockClipboard.js";

// Helpers
export {
	createNotAvailableError,
	createReadError,
	createWriteError,
	createPermissionDeniedError,
	createFormatNotSupportedError,
	createSizeExceededError,
} from "./Implementation/ClipboardHelper.js";

// Layers
export { default as LiveClipboardServiceLayer } from "./Live.js";
export { default as MockClipboardServiceLayer } from "./Mock.js";
