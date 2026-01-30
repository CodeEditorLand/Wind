/**
 * @module Application/Clipboard
 * @description
 * Clipboard service implementation for Wind project.
 * Provides read/write operations for clipboard functionality.
 */
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Context from "effect/Context";
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
export type ClipboardError = {
    _tag: "ClipboardNotAvailable";
    reason: string;
} | {
    _tag: "ClipboardReadError";
    error: Error;
} | {
    _tag: "ClipboardWriteError";
    error: Error;
};
/**
 * Clipboard service tag
 */
export declare const ClipboardServiceTag: <Self, Type extends Effect.Tag.AllowedType>() => Context.TagClass<Self, ClipboardService, Type> & (Type extends Record<PropertyKey, any> ? Effect.Tag.Proxy<Self, Type> : {}) & {
    use: <X>(body: (_: Type) => X) => [X] extends [Effect.Effect<infer A, infer E, infer R>] ? Effect.Effect<A, E, R | Self> : [X] extends [PromiseLike<infer A_1>] ? Effect.Effect<A_1, import("effect/Cause").UnknownException, Self> : Effect.Effect<X, never, Self>;
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