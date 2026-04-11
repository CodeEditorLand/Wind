var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { emit, listen } from "@tauri-apps/api/event";
const CleanupMap = /* @__PURE__ */ new Map();
const IsTauri = typeof window !== "undefined" && window.__TAURI__ !== void 0;
const ipcRenderer = {
  send: /* @__PURE__ */ __name((channel, ...args) => {
    emit(channel, args.length === 1 ? args[0] : args);
  }, "send"),
  invoke: /* @__PURE__ */ __name(async (channel, ...args) => {
    const invokeArgs = args.length === 0 ? void 0 : args.length === 1 ? args[0] : args;
    return tauriInvoke(channel, invokeArgs);
  }, "invoke"),
  on: /* @__PURE__ */ __name((channel, listener) => {
    listen(channel, (event) => {
      listener(event, event.payload);
    }).then((unlisten) => {
      const Cleanup = /* @__PURE__ */ __name(() => unlisten(), "Cleanup");
      CleanupMap.set(channel, Cleanup);
    });
  }, "on"),
  once: /* @__PURE__ */ __name((channel, listener) => {
    const wrappedListener = /* @__PURE__ */ __name((event) => {
      listener(event, event.payload || event);
    }, "wrappedListener");
    listen(channel, wrappedListener).then((Unlisten) => {
      setTimeout(() => Unlisten(), 0);
    });
  }, "once"),
  removeListener: /* @__PURE__ */ __name((channel, _listener) => {
    const Cleanup = CleanupMap.get(channel);
    if (Cleanup) {
      Cleanup();
      CleanupMap.delete(channel);
    }
  }, "removeListener"),
  removeAllListeners: /* @__PURE__ */ __name((channel) => {
    const Cleanup = CleanupMap.get(channel);
    if (Cleanup) {
      Cleanup();
      CleanupMap.delete(channel);
    }
  }, "removeAllListeners")
};
const ipcMessagePort = {
  acquire: /* @__PURE__ */ __name((responseChannel, nonce) => {
    const { port1, port2 } = new MessageChannel();
    window.postMessage(nonce, "*", [port2]);
    port1.start();
    let HandshakeComplete = false;
    let MessageCount = 0;
    const ForwardToMountain = /* @__PURE__ */ __name((Data) => {
      const Invoke = window.__TAURI__?.core?.invoke ?? window.__TAURI__?.invoke;
      if (typeof Invoke === "function") {
        const Bytes = Data instanceof Uint8Array ? Array.from(Data) : Array.from(new Uint8Array(Data));
        Invoke("MountainIPCInvoke", {
          method: "cocoon:extensionHostMessage",
          params: [{ data: Bytes, responseChannel }]
        }).catch(() => {
        });
      }
    }, "ForwardToMountain");
    port1.onmessage = (Event2) => {
      const Data = Event2.data;
      const Length = Data instanceof ArrayBuffer ? Data.byteLength : Data instanceof Uint8Array ? Data.byteLength : typeof Data === "object" && Data?.byteLength ? Data.byteLength : 0;
      if (!HandshakeComplete) {
        if (Length > 1) {
          HandshakeComplete = true;
          try {
            performance.mark("land:exthost:handshake-complete");
          } catch {
          }
          ForwardToMountain(
            Data instanceof Uint8Array ? Data : new Uint8Array(Data)
          );
          port1.postMessage(new Uint8Array([1]));
        }
        return;
      }
      MessageCount++;
      try {
        performance.mark(`land:exthost:message:${MessageCount}`, {
          detail: { bytes: Length }
        });
      } catch {
      }
      if (Length > 0) {
        ForwardToMountain(
          Data instanceof Uint8Array ? Data : new Uint8Array(Data)
        );
      }
    };
    const TauriListen = window.__TAURI__?.event?.listen;
    if (typeof TauriListen === "function") {
      TauriListen(
        "cocoon:extensionHostReply",
        (Event2) => {
          if (Event2?.payload?.data) {
            port1.postMessage(new Uint8Array(Event2.payload.data));
          }
        }
      ).catch(() => {
      });
    }
    setTimeout(() => {
      port1.postMessage(new Uint8Array([2]));
    }, 50);
  }, "acquire")
};
const webFrame = {
  setZoomLevel: /* @__PURE__ */ __name((level) => {
    document.documentElement.style.setProperty(
      "--zoom-level",
      String(level)
    );
  }, "setZoomLevel")
};
const process = {
  platform: (navigator.platform || "unknown").toLowerCase().includes("win") ? "win32" : (navigator.platform || "unknown").toLowerCase().includes("mac") ? "darwin" : "linux",
  arch: "x64",
  // FUTURE: Detect from Tauri - arch detection requires Tauri platform info
  env: {},
  versions: {
    node: "20.0.0",
    // Placeholder
    chrome: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || "unknown",
    electron: "30.0.0"
    // Placeholder for compatibility
  },
  cwd: /* @__PURE__ */ __name(() => "/app", "cwd"),
  shellEnv: /* @__PURE__ */ __name(async () => ({}), "shellEnv"),
  getProcessMemoryInfo: /* @__PURE__ */ __name(async () => ({
    workingSetSize: 0,
    peakWorkingSetSize: 0,
    privateBytes: 0,
    sharedBytes: 0
  }), "getProcessMemoryInfo"),
  on: /* @__PURE__ */ __name((_type, _callback) => {
  }, "on")
};
let CachedConfiguration = null;
const context = {
  configuration: /* @__PURE__ */ __name(async () => {
    if (CachedConfiguration) return CachedConfiguration;
    try {
      const Config = await tauriInvoke(
        "mountain_get_workbench_configuration"
      );
      CachedConfiguration = Config;
      return Config;
    } catch (error) {
      throw error;
    }
  }, "configuration"),
  resolveConfiguration: /* @__PURE__ */ __name(async () => {
    return context.configuration();
  }, "resolveConfiguration")
};
const webUtils = {
  getPathForFile: /* @__PURE__ */ __name((file) => {
    return `file://${file.name}`;
  }, "getPathForFile")
};
const Globals = {
  ipcRenderer,
  ipcMessagePort,
  webFrame,
  process,
  context,
  webUtils
};
if (IsTauri) {
  window.vscode = Globals;
  window.dispatchEvent(new Event("vscode-wind-preload-ready"));
} else {
}
//# sourceMappingURL=Preload.js.map
