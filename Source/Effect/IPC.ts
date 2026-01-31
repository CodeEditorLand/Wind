/**
 * @module Effect/IPC
 * @description
 * Atomic IPC service using Effect-TS.
 * Wraps Tauri IPC with typed effects and streams.
 */

import { Context, Effect, Stream, Layer } from "effect";
import { invoke, listen, emit } from '@tauri-apps/api/event';
import type { IPCMessage } from "../Types/Sandbox.js";
import { SandboxNotReadyError } from "../Types/Sandbox.js";

// ============================================================================
// IPC Error Types
// ============================================================================

export class IPCInvokeError extends Error {
  readonly _tag = "IPCInvokeError";
  constructor(readonly channel: string, readonly cause: unknown) {
    super(`IPC invoke failed on channel '${channel}': ${String(cause)}`);
  }
}

export class IPCSendError extends Error {
  readonly _tag = "IPCSendError";
  constructor(readonly channel: string, readonly cause: unknown) {
    super(`IPC send failed on channel '${channel}': ${String(cause)}`);
  }
}

export class IPCSubscriptionError extends Error {
  readonly _tag = "IPCSubscriptionError";
  constructor(readonly channel: string, readonly cause: unknown) {
    super(`IPC subscription failed on channel '${channel}': ${String(cause)}`);
  }
}

// ============================================================================
// IPC Service Interface
// ============================================================================

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

// Tag for dependency injection
export const IPC = Context.GenericTag<IPCService>("IPC");

// ============================================================================
// Tauri Implementation
// ============================================================================

export const IPCTauriLive = Layer.effect(
  IPC,
  Effect.gen(function* () {
    // Verify Tauri is available
    const isTauri = typeof window !== 'undefined' && 
                   (window as any).__TAURI__ !== undefined;
    
    if (!isTauri) {
      return yield* Effect.die(new SandboxNotReadyError());
    }

    // Atom: send
    const send = (channel: string) => (args: ReadonlyArray<unknown>) =>
      Effect.try({
        try: () => emit(channel, args.length === 1 ? args[0] : args),
        catch: (error) => new IPCSendError(channel, error)
      });

    // Atom: invoke
    const invoke_ = (channel: string) => (args: ReadonlyArray<unknown>) =>
      Effect.tryPromise({
        try: () => invoke(channel, args.length === 1 ? args[0] : args),
        catch: (error) => new IPCInvokeError(channel, error)
      });

    // Atom: events as Stream
    const events = (channel: string): Stream.Stream<IPCMessage, IPCSubscriptionError> =>
      Stream.async((emit) => {
        let cleanup: (() => void) | undefined;

        listen(channel, (event) => {
          emit.single({
            channel,
            args: [event.payload]
          });
        }).then((unlisten) => {
          cleanup = unlisten;
        }).catch((error) => {
          emit.fail(new IPCSubscriptionError(channel, error));
        });

        return Effect.sync(() => cleanup?.());
      });

    // Atom: once
    const once = (channel: string): Effect.Effect<IPCMessage, IPCSubscriptionError> =>
      Effect.async((resume) => {
        listen(channel, (event) => {
          resume(Effect.succeed({
            channel,
            args: [event.payload]
          }));
        }, { once: true }).catch((error) => {
          resume(Effect.fail(new IPCSubscriptionError(channel, error)));
        });
      });

    // Atom: remove all listeners
    const removeAllListeners = (channel: string) =>
      Effect.log(`[IPC] Remove all listeners for ${channel}`).pipe(
        Effect.asUnit
      );

    return {
      send,
      invoke: invoke_,
      events,
      once,
      removeAllListeners
    };
  })
);

// ============================================================================
// Electron Implementation (for Sky)
// ============================================================================

export const IPCElectronLive = Layer.effect(
  IPC,
  Effect.gen(function* () {
    // Access Electron's ipcRenderer from preload
    const vscode = (window as any).vscode;
    
    if (!vscode?.ipcRenderer) {
      return yield* Effect.die(new SandboxNotReadyError());
    }

    const { ipcRenderer } = vscode;

    const send = (channel: string) => (args: ReadonlyArray<unknown>) =>
      Effect.sync(() => {
        ipcRenderer.send(channel, ...args);
      }).pipe(
        Effect.mapError((error) => new IPCSendError(channel, error))
      );

    const invoke_ = (channel: string) => (args: ReadonlyArray<unknown>) =>
      Effect.tryPromise({
        try: () => ipcRenderer.invoke(channel, ...args),
        catch: (error) => new IPCInvokeError(channel, error)
      });

    const events = (channel: string): Stream.Stream<IPCMessage, IPCSubscriptionError> =>
      Stream.async((emit) => {
        const listener = (_event: unknown, ...args: unknown[]) => {
          emit.single({ channel, args });
        };

        ipcRenderer.on(channel, listener);

        return Effect.sync(() => {
          ipcRenderer.removeListener(channel, listener);
        });
      });

    const once = (channel: string): Effect.Effect<IPCMessage, IPCSubscriptionError> =>
      Effect.async((resume) => {
        const listener = (_event: unknown, ...args: unknown[]) => {
          resume(Effect.succeed({ channel, args }));
        };

        ipcRenderer.once(channel, listener);
      });

    const removeAllListeners = (channel: string) =>
      Effect.sync(() => {
        ipcRenderer.removeAllListeners(channel);
      });

    return {
      send,
      invoke: invoke_,
      events,
      once,
      removeAllListeners
    };
  })
);

// ============================================================================
// Mock Implementation (for testing)
// ============================================================================

export const IPCMockLive = Layer.succeed(
  IPC,
  {
    send: (_channel: string) => (_args: ReadonlyArray<unknown>) => Effect.unit,
    invoke: (_channel: string) => (_args: ReadonlyArray<unknown>) => Effect.succeed({}),
    events: (_channel: string) => Stream.empty,
    once: (_channel: string) => Effect.succeed({ channel: _channel, args: [] }),
    removeAllListeners: (_channel: string) => Effect.unit
  }
);
