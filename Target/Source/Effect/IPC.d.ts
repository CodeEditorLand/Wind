/**
 * @module Effect/IPC
 * @description
 * Atomic IPC service using Effect-TS.
 * Wraps Tauri IPC with typed effects and streams.
 */
import { Context, Effect, Layer, Stream } from "effect";
import { type IPCMessage } from "../Types/Sandbox.js";
export declare class IPCInvokeError extends Error {
    readonly _tag = "IPCInvokeError";
    readonly _channel: string;
    readonly _cause: unknown;
    constructor(channel: string, cause: unknown);
    get name(): string;
    get channel(): string;
    get cause(): unknown;
}
export declare class IPCSendError extends Error {
    readonly _tag = "IPCSendError";
    readonly _channel: string;
    readonly _cause: unknown;
    constructor(channel: string, cause: unknown);
    get name(): string;
    get channel(): string;
    get cause(): unknown;
}
export declare class IPCSubscriptionError extends Error {
    readonly _tag = "IPCSubscriptionError";
    readonly _channel: string;
    readonly _cause: unknown;
    constructor(channel: string, cause: unknown);
    get name(): string;
    get channel(): string;
    get cause(): unknown;
}
export interface IPCService {
    /** Send a message without expecting a response */
    readonly send: (channel: string) => (args: ReadonlyArray<unknown>) => Effect.Effect<void, IPCSendError>;
    /** Invoke a method and await response */
    readonly invoke: (channel: string) => (args: ReadonlyArray<unknown>) => Effect.Effect<unknown, IPCInvokeError>;
    /** Subscribe to events on a channel as a Stream */
    readonly events: (channel: string) => Stream.Stream<IPCMessage, IPCSubscriptionError>;
    /** One-shot event listener */
    readonly once: (channel: string) => Effect.Effect<IPCMessage, IPCSubscriptionError>;
    /** Remove all listeners for a channel */
    readonly removeAllListeners: (channel: string) => Effect.Effect<void, never>;
}
declare const IPCTag_base: Context.TagClass<IPCTag, "IPC", IPCService>;
export declare class IPCTag extends IPCTag_base {
}
export declare const IPC: typeof IPCTag;
export declare const IPCTauriLive: Layer.Layer<IPCTag, never, never>;
export declare const IPCElectronLive: Layer.Layer<IPCTag, never, never>;
export declare const IPCMockLive: Layer.Layer<IPCTag, never, never>;
export {};
//# sourceMappingURL=IPC.d.ts.map