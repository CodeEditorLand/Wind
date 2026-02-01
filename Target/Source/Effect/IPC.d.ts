/**
 * @module Effect/IPC
 * @description
 * Atomic IPC service using Effect-TS.
 * Wraps Tauri IPC with typed effects and streams.
 */
import { Context, Effect, Layer, Stream } from "effect";
import { type IPCMessage } from "../Types/Sandbox.js";
export declare class IPCInvokeError extends Error {
    readonly channel: string;
    readonly cause: unknown;
    readonly _tag = "IPCInvokeError";
    constructor(channel: string, cause: unknown);
}
export declare class IPCSendError extends Error {
    readonly channel: string;
    readonly cause: unknown;
    readonly _tag = "IPCSendError";
    constructor(channel: string, cause: unknown);
}
export declare class IPCSubscriptionError extends Error {
    readonly channel: string;
    readonly cause: unknown;
    readonly _tag = "IPCSubscriptionError";
    constructor(channel: string, cause: unknown);
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
export declare const IPC: Context.Tag<IPCService, IPCService>;
export declare const IPCTauriLive: Layer.Layer<IPCService, never, never>;
export declare const IPCElectronLive: Layer.Layer<IPCService, never, never>;
export declare const IPCMockLive: Layer.Layer<IPCService, never, never>;
//# sourceMappingURL=IPC.d.ts.map