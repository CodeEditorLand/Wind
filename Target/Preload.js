var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { emit, listen } from "@tauri-apps/api/event";
import { invoke as tauriInvoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";
const cleanupMap = /* @__PURE__ */ new Map();
const isTauri = typeof window !== "undefined" && window.__TAURI__ !== void 0;
const ipcRenderer = {
  send: /* @__PURE__ */ __name((channel, ...args) => {
    emit(channel, args.length === 1 ? args[0] : args);
  }, "send"),
  invoke: /* @__PURE__ */ __name(async (channel, ...args) => {
    return tauriInvoke(channel, args.length === 1 ? args[0] : args);
  }, "invoke"),
  on: /* @__PURE__ */ __name((channel, listener) => {
    listen(channel, (event) => {
      listener(event, event.payload);
    }).then((unlisten) => {
      const cleanup = /* @__PURE__ */ __name(() => unlisten(), "cleanup");
      cleanupMap.set(channel, cleanup);
    });
  }, "on"),
  once: /* @__PURE__ */ __name((channel, listener) => {
    listen(
      channel,
      (event) => {
        listener(event, event.payload);
      },
      { once: true }
    );
  }, "once"),
  removeListener: /* @__PURE__ */ __name((channel, _listener) => {
    const cleanup = cleanupMap.get(channel);
    if (cleanup) {
      cleanup();
      cleanupMap.delete(channel);
    }
  }, "removeListener"),
  removeAllListeners: /* @__PURE__ */ __name((channel) => {
    const cleanup = cleanupMap.get(channel);
    if (cleanup) {
      cleanup();
      cleanupMap.delete(channel);
    }
  }, "removeAllListeners")
};
const ipcMessagePort = {
  acquire: /* @__PURE__ */ __name((responseChannel, nonce) => {
    console.log(
      `[Preload] MessagePort acquire requested: ${responseChannel}, ${nonce}`
    );
    setTimeout(() => {
      ipcRenderer.send(responseChannel, nonce);
    }, 0);
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
  // TODO: Detect from Tauri
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
let cachedConfiguration = null;
const context = {
  configuration: /* @__PURE__ */ __name(async () => {
    if (cachedConfiguration) return cachedConfiguration;
    try {
      const config = await tauriInvoke("mountain_get_workbench_configuration");
      cachedConfiguration = config;
      return config;
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
const globals = {
  ipcRenderer,
  ipcMessagePort,
  webFrame,
  process,
  context,
  webUtils
};
if (isTauri) {
  window.vscode = globals;
  console.log("[Preload] \u2705 Sandbox globals exposed to window.vscode");
  window.dispatchEvent(new Event("vscode-wind-preload-ready"));
} else {
  console.error("[Preload] \u274C Tauri not detected - preload failed");
}
//# sourceMappingURL=Preload.js.map
