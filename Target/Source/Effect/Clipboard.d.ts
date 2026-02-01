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
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
/**
 * Clipboard service interface
 * Microsoft VSCode Reference: IClipboardService from vs/platform/clipboard/common/clipboardService.ts
 */
export interface ClipboardService {
    readonly ReadText: () => Effect.Effect<string, ClipboardProblem>;
    readonly WriteText: (text: string) => Effect.Effect<void, ClipboardProblem>;
    readonly ReadHTML: () => Effect.Effect<string, ClipboardProblem>;
    readonly WriteHTML: (html: string, text: string) => Effect.Effect<void, ClipboardProblem>;
    readonly ReadImage: () => Effect.Effect<Blob, ClipboardProblem>;
    readonly WriteImage: (blob: Blob) => Effect.Effect<void, ClipboardProblem>;
    readonly HasText: () => Effect.Effect<boolean, ClipboardProblem>;
    readonly Clear: () => Effect.Effect<void, ClipboardProblem>;
}
/**
 * Clipboard error types with categorization
 * Microsoft VSCode Reference: Clipboard error handling patterns
 */
export type ClipboardProblem = {
    readonly _tag: "ClipboardNotAvailable";
    readonly reason: string;
} | {
    readonly _tag: "ClipboardReadError";
    readonly error: Error;
} | {
    readonly _tag: "ClipboardWriteError";
    readonly error: Error;
} | {
    readonly _tag: "ClipboardPermissionDenied";
    readonly reason: string;
} | {
    readonly _tag: "ClipboardFormatNotSupported";
    readonly format: string;
} | {
    readonly _tag: "ClipboardSizeExceeded";
    readonly size: number;
    readonly limit: number;
};
/**
 * Clipboard service tag
 */
export declare const ClipboardServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => Context.TagClass<Self, ClipboardService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, Self | R> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
};
/**
 * Live clipboard service layer
 */
export declare const LiveClipboardServiceLayer: Layer.Layer<unknown, never, never>;
/**
 * Mock clipboard service layer
 */
export declare const MockClipboardServiceLayer: Layer.Layer<unknown, never, never>;
//# sourceMappingURL=Clipboard.d.ts.map