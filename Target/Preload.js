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
    console.log(
      `[Preload] MessagePort acquire: ${responseChannel}, nonce=${nonce}`
    );
    const { port1, port2 } = new MessageChannel();
    window.postMessage(nonce, "*", [port2]);
    port1.start();
    let HandshakeComplete = false;
    port1.onmessage = (Event2) => {
      if (HandshakeComplete) {
        return;
      }
      const Data = Event2.data;
      const Length = Data instanceof ArrayBuffer ? Data.byteLength : Data instanceof Uint8Array ? Data.byteLength : typeof Data === "object" && Data?.byteLength ? Data.byteLength : 0;
      if (Length > 1) {
        HandshakeComplete = true;
        console.log(
          "[Preload] Extension host: received init data, sending Initialized"
        );
        port1.postMessage(new Uint8Array([1]));
      }
    };
    setTimeout(() => {
      console.log("[Preload] Extension host: sending Ready");
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
    console.log(`[Preload] Zoom level set to: ${level}`);
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
      console.error("[Preload] Failed to fetch configuration:", error);
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
  console.log("[Preload]\u2001Sandbox globals exposed to window.vscode");
  window.dispatchEvent(new Event("vscode-wind-preload-ready"));
} else {
  console.error("[Preload]\u2001Tauri not detected - preload failed");
}
//# sourceMappingURL=Preload.js.map
