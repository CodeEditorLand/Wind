var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { emit, listen } from "@tauri-apps/api/event";
import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { Context, Effect, Layer, Stream } from "effect";
import { SandboxNotReadyError } from "../Types/Sandbox.js";
class IPCInvokeError extends Error {
  static {
    __name(this, "IPCInvokeError");
  }
  _tag = "IPCInvokeError";
  _channel;
  _cause;
  constructor(channel, cause) {
    super(`IPC invoke failed on channel '${channel}': ${String(cause)}`);
    this._channel = channel;
    this._cause = cause;
    Object.setPrototypeOf(this, IPCInvokeError.prototype);
  }
  get name() {
    return "IPCInvokeError";
  }
  get channel() {
    return this._channel;
  }
  get cause() {
    return this._cause;
  }
}
class IPCSendError extends Error {
  static {
    __name(this, "IPCSendError");
  }
  _tag = "IPCSendError";
  _channel;
  _cause;
  constructor(channel, cause) {
    super(`IPC send failed on channel '${channel}': ${String(cause)}`);
    this._channel = channel;
    this._cause = cause;
    Object.setPrototypeOf(this, IPCSendError.prototype);
  }
  get name() {
    return "IPCSendError";
  }
  get channel() {
    return this._channel;
  }
  get cause() {
    return this._cause;
  }
}
class IPCSubscriptionError extends Error {
  static {
    __name(this, "IPCSubscriptionError");
  }
  _tag = "IPCSubscriptionError";
  _channel;
  _cause;
  constructor(channel, cause) {
    super(
      `IPC subscription failed on channel '${channel}': ${String(cause)}`
    );
    this._channel = channel;
    this._cause = cause;
    Object.setPrototypeOf(this, IPCSubscriptionError.prototype);
  }
  get name() {
    return "IPCSubscriptionError";
  }
  get channel() {
    return this._channel;
  }
  get cause() {
    return this._cause;
  }
}
class IPCTag extends Context.Tag("IPC")() {
  static {
    __name(this, "IPCTag");
  }
}
const IPC = IPCTag;
const IPCTauriLive = Layer.effect(
  IPC,
  Effect.gen(function* () {
    const isTauriAvailable = typeof window !== "undefined" && window.__TAURI__ !== void 0;
    if (!isTauriAvailable) {
      return yield* Effect.die(new SandboxNotReadyError());
    }
    const send = /* @__PURE__ */ __name((channel) => (args) => Effect.try({
      try: /* @__PURE__ */ __name(() => emit(channel, args.length === 1 ? args[0] : args), "try"),
      catch: /* @__PURE__ */ __name((error) => new IPCSendError(channel, error), "catch")
    }).pipe(
      Effect.mapError((error) => new IPCSendError(channel, error))
    ), "send");
    const invoke_ = /* @__PURE__ */ __name((channel) => (args) => Effect.tryPromise({
      try: /* @__PURE__ */ __name(() => {
        const invokeArgs = args.length === 1 ? args[0] : args;
        return tauriInvoke(channel, invokeArgs);
      }, "try"),
      catch: /* @__PURE__ */ __name((error) => new IPCInvokeError(channel, error), "catch")
    }), "invoke_");
    const events = /* @__PURE__ */ __name((channel) => Stream.async((emit2) => {
      let cleanup;
      listen(channel, (event) => {
        emit2.single({
          channel,
          args: [event.payload]
        });
      }).then((unlisten) => {
        cleanup = unlisten;
      }).catch((error) => {
        emit2.fail(new IPCSubscriptionError(channel, error));
      });
      return Effect.sync(() => cleanup?.());
    }), "events");
    const once = /* @__PURE__ */ __name((channel) => Effect.async((resume) => {
      listen(channel, (event) => {
        resume(
          Effect.succeed({
            channel,
            args: [event.payload]
          })
        );
      }).catch((error) => {
        resume(
          Effect.fail(new IPCSubscriptionError(channel, error))
        );
      });
    }), "once");
    const removeAllListeners = /* @__PURE__ */ __name((channel) => Effect.log(`[IPC] Remove all listeners for ${channel}`).pipe(
      Effect.map(() => void 0)
    ), "removeAllListeners");
    return {
      send,
      invoke: invoke_,
      events,
      once,
      removeAllListeners
    };
  })
);
const IPCElectronLive = Layer.effect(
  IPC,
  Effect.gen(function* () {
    const vscode = window.vscode;
    if (!vscode?.ipcRenderer) {
      return yield* Effect.die(new SandboxNotReadyError());
    }
    const { ipcRenderer } = vscode;
    const send = /* @__PURE__ */ __name((channel) => (args) => Effect.sync(() => {
      ipcRenderer.send(channel, ...args);
    }).pipe(
      Effect.mapError((error) => new IPCSendError(channel, error))
    ), "send");
    const invoke_ = /* @__PURE__ */ __name((channel) => (args) => Effect.tryPromise({
      try: /* @__PURE__ */ __name(() => ipcRenderer.invoke(channel, ...args), "try"),
      catch: /* @__PURE__ */ __name((error) => new IPCInvokeError(channel, error), "catch")
    }), "invoke_");
    const events = /* @__PURE__ */ __name((channel) => Stream.async((emit2) => {
      const listener = /* @__PURE__ */ __name((_event, ...args) => {
        emit2.single({ channel, args });
      }, "listener");
      ipcRenderer.on(channel, listener);
      return Effect.sync(() => {
        ipcRenderer.removeListener(channel, listener);
      });
    }), "events");
    const once = /* @__PURE__ */ __name((channel) => Effect.async((resume) => {
      const listener = /* @__PURE__ */ __name((_event, ...args) => {
        resume(Effect.succeed({ channel, args }));
      }, "listener");
      ipcRenderer.once(channel, listener);
    }), "once");
    const removeAllListeners = /* @__PURE__ */ __name((channel) => Effect.sync(() => {
      ipcRenderer.removeAllListeners(channel);
    }), "removeAllListeners");
    return {
      send,
      invoke: invoke_,
      events,
      once,
      removeAllListeners
    };
  })
);
const IPCMockLive = Layer.succeed(IPC, {
  send: /* @__PURE__ */ __name((_channel) => (_args) => Effect.void, "send"),
  invoke: /* @__PURE__ */ __name((_channel) => (_args) => Effect.succeed({}), "invoke"),
  events: /* @__PURE__ */ __name((_channel) => Stream.empty, "events"),
  once: /* @__PURE__ */ __name((_channel) => Effect.succeed({ channel: _channel, args: [] }), "once"),
  removeAllListeners: /* @__PURE__ */ __name((_channel) => Effect.void, "removeAllListeners")
});
export {
  IPC,
  IPCElectronLive,
  IPCInvokeError,
  IPCMockLive,
  IPCSendError,
  IPCSubscriptionError,
  IPCTag,
  IPCTauriLive
};
//# sourceMappingURL=IPC.js.map
