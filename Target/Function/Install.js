var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function Install() {
  try {
    if (typeof window === "undefined") {
      const error = new Error(
        "Cannot install Wind polyfill: window is not defined"
      );
      console.error(error);
      return;
    }
    if (window.polyfillInstalled) {
      return;
    }
    window.polyfillInstalled = true;
    const Configuration = await ResolveConfiguration();
    const IPCRenderer = createIpcRenderer();
    const Process = createProcess(Configuration);
    const Globals = {
      ipcRenderer: IPCRenderer,
      process: Process,
      context: {
        configuration: /* @__PURE__ */ __name(() => Configuration, "configuration"),
        resolveConfiguration: /* @__PURE__ */ __name(async () => Configuration, "resolveConfiguration")
      },
      webFrame: { setZoomLevel: /* @__PURE__ */ __name(() => {
      }, "setZoomLevel") },
      webUtils: { getPathForFile: /* @__PURE__ */ __name((file) => file.name, "getPathForFile") },
      ipcMessagePort: { acquire: /* @__PURE__ */ __name(() => {
      }, "acquire") }
    };
    window.vscode = Globals;
    console.info(
      "[Wind] Successfully installed Electron API polyfill for workbench."
    );
  } catch (error) {
    console.error(`[Wind] Install error:`, error);
    fallback(error);
  }
}
__name(Install, "Install");
function createIpcRenderer() {
  return {
    send: /* @__PURE__ */ __name((channel) => {
      if (!validateIPCChannel(channel)) return;
    }, "send"),
    invoke: /* @__PURE__ */ __name(async (channel) => {
      if (!validateIPCChannel(channel)) {
        throw new Error(`Invalid IPC channel: ${channel}`);
      }
      return {};
    }, "invoke"),
    on: /* @__PURE__ */ __name((channel, listener) => {
      if (!validateIPCChannel(channel)) return this;
      return this;
    }, "on"),
    once: /* @__PURE__ */ __name((channel, listener) => {
      if (!validateIPCChannel(channel)) return this;
      return this;
    }, "once"),
    removeListener: /* @__PURE__ */ __name((channel, listener) => {
      return this;
    }, "removeListener")
  };
}
__name(createIpcRenderer, "createIpcRenderer");
function createProcess(configuration) {
  return {
    platform: "web",
    arch: "web",
    type: "renderer",
    versions: { webview_runtime: navigator.userAgent },
    env: configuration.userEnv,
    cwd: /* @__PURE__ */ __name(() => "/", "cwd"),
    sandboxed: true,
    execPath: "/app/vscode-wind",
    resourcesPath: "/app/resources",
    on: /* @__PURE__ */ __name((type, callback) => {
    }, "on"),
    getProcessMemoryInfo: /* @__PURE__ */ __name(async () => CrossFunctions.CrossFunctions, "getProcessMemoryInfo"),
    shellEnv: /* @__PURE__ */ __name(async () => Promise.resolve({ PATH: "/usr/bin:/bin" }), "shellEnv")
  };
}
__name(createProcess, "createProcess");
async function ResolveConfiguration() {
  return {
    windowId: 1,
    appRoot: "file:///app",
    userEnv: { PATH: "/usr/bin:/bin", HOME: "/" },
    product: { nameShort: "VSCode Wind", applicationName: "vscode-wind" },
    zoomLevel: 0,
    nls: { messages: [], language: "en" }
  };
}
__name(ResolveConfiguration, "ResolveConfiguration");
function validateIPCChannel(channel) {
  if (!channel || typeof channel !== "string") return false;
  if (typeof navigator !== "undefined" && !channel.startsWith("vscode:"))
    return false;
  return true;
}
__name(validateIPCChannel, "validateIPCChannel");
function fallback(error) {
  if (typeof window.legacyBridge !== "undefined") {
    window.vscode = window.legacyBridge;
    return;
  }
  if (typeof window.vscode === "undefined") {
    window.vscode = {
      process: { platform: "web" },
      ipcRenderer: { send: /* @__PURE__ */ __name(() => {
      }, "send") }
    };
  }
}
__name(fallback, "fallback");
export {
  ResolveConfiguration,
  createIpcRenderer,
  createProcess,
  Install as default,
  fallback,
  validateIPCChannel
};
//# sourceMappingURL=Install.js.map
