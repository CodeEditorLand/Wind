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
    console.log("[Wind] Starting Wind preload installation...");
    InstallBrowserAPIPolyfills();
    const Configuration = await ResolveConfiguration();
    const IPCRenderer = CreateIPCRenderer();
    const Process = CreateProcess(Configuration);
    const preloadGlobals = {
      ipcRenderer: IPCRenderer,
      process: Process,
      configuration: Configuration
    };
    window.preloadGlobals = preloadGlobals;
    console.log("[Wind] preloadGlobals attached to window");
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
    window.__WIND_PRELOAD_READY__ = true;
    console.log("[Wind] Preload ready, Effect-TS bootstrap can proceed");
  } catch (error) {
    console.error(`[Wind] Install error:`, error);
    Fallback();
  }
}
__name(Install, "Install");
function CreateIPCRenderer() {
  const self = {
    send: /* @__PURE__ */ __name((Channel) => {
      if (!ValidateIPCChannel(Channel)) return;
    }, "send"),
    invoke: /* @__PURE__ */ __name(async (Channel) => {
      if (!ValidateIPCChannel(Channel)) {
        throw new Error(`Invalid IPC channel: ${Channel}`);
      }
      return {};
    }, "invoke"),
    on: /* @__PURE__ */ __name((_Channel, _Listener) => {
      return self;
    }, "on"),
    once: /* @__PURE__ */ __name((_Channel, _Listener) => {
      return self;
    }, "once"),
    removeListener: /* @__PURE__ */ __name((_Channel, _Listener) => {
      return self;
    }, "removeListener")
  };
  return self;
}
__name(CreateIPCRenderer, "CreateIPCRenderer");
function CreateProcess(Configuration) {
  return {
    platform: "web",
    arch: "web",
    type: "renderer",
    execPath: "/",
    env: Configuration.userEnv ?? {},
    cwd: /* @__PURE__ */ __name(() => "/", "cwd"),
    versions: {
      node: "20.0.0",
      chrome: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || "0",
      electron: "0.0.0"
    },
    on: /* @__PURE__ */ __name((_Type, _Callback) => {
    }, "on"),
    getProcessMemoryInfo: /* @__PURE__ */ __name(async () => ({
      private: 0,
      residentSet: 0,
      shared: 0
    }), "getProcessMemoryInfo"),
    shellEnv: /* @__PURE__ */ __name(async () => ({}), "shellEnv")
  };
}
__name(CreateProcess, "CreateProcess");
async function ResolveConfiguration() {
  const FileRoot = "/Static/Application/";
  return {
    windowId: 1,
    // Electron workbench computes baseUrl from appRoot:
    //   new URL(`${fileUriFromPath(appRoot, {scheme:'vscode-file'})}/out/`)
    // We override _VSCODE_FILE_ROOT after load, but appRoot is still
    // read for path construction. Point it at the embedded assets root.
    appRoot: FileRoot,
    userEnv: { PATH: "/usr/bin:/bin", HOME: "/" },
    // INativeWindowConfiguration fields for Electron workbench
    mainPid: 0,
    machineId: "tauri-machine",
    sqmId: "",
    devDeviceId: "",
    isPortable: false,
    execPath: "/",
    homeDir: "/",
    tmpDir: "/tmp",
    userDataDir: "/",
    logLevel: 2,
    loggers: [],
    perfMarks: [],
    colorScheme: { dark: true, highContrast: false },
    autoDetectHighContrast: false,
    autoDetectColorScheme: false,
    profiles: {
      home: { scheme: "vscode-userdata", path: "/User" },
      all: [],
      profile: {
        id: "__default__profile__",
        isDefault: true,
        name: "Default",
        location: void 0,
        globalStorageHome: {
          scheme: "vscode-userdata",
          path: "/User/globalStorage"
        },
        settingsResource: {
          scheme: "vscode-userdata",
          path: "/User/settings.json"
        },
        keybindingsResource: {
          scheme: "vscode-userdata",
          path: "/User/keybindings.json"
        },
        tasksResource: {
          scheme: "vscode-userdata",
          path: "/User/tasks.json"
        },
        snippetsHome: {
          scheme: "vscode-userdata",
          path: "/User/snippets"
        },
        extensionsResource: void 0,
        cacheHome: {
          scheme: "vscode-userdata",
          path: "/User/cacheHome"
        }
      }
    },
    product: {
      nameShort: "VSCode Wind",
      nameLong: "VSCode Wind",
      applicationName: "vscode-wind",
      version: "0.0.1",
      commit: "dev",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      urlProtocol: "vscode-wind",
      dataFolderName: "vscode-wind",
      serverApplicationName: "vscode-wind-server",
      extensionProperties: {},
      defaultChatAgent: {
        extensionId: "vscode",
        chatExtensionId: "vscode",
        chatExtensionOutputId: "vscode",
        documentationUrl: "https://code.visualstudio.com/docs",
        skusDocumentationUrl: "https://code.visualstudio.com/docs",
        publicCodeMatchesUrl: "https://code.visualstudio.com/docs",
        manageSettingsUrl: "https://code.visualstudio.com/docs",
        managePlanUrl: "https://code.visualstudio.com/docs",
        manageOverageUrl: "https://code.visualstudio.com/docs",
        upgradePlanUrl: "https://code.visualstudio.com/docs",
        signUpUrl: "https://code.visualstudio.com/docs",
        termsStatementUrl: "https://code.visualstudio.com/terms",
        privacyStatementUrl: "https://privacy.microsoft.com",
        provider: {
          default: { id: "default", name: "Default" },
          enterprise: { id: "enterprise", name: "Enterprise" },
          google: { id: "google", name: "Google" },
          apple: { id: "apple", name: "Apple" }
        },
        providerUriSetting: "ai.provider.uri",
        providerScopes: [["read"], ["write"]],
        entitlementUrl: "https://code.visualstudio.com/docs",
        entitlementSignupLimitedUrl: "https://code.visualstudio.com/docs",
        tokenEntitlementUrl: "https://code.visualstudio.com/docs",
        mcpRegistryDataUrl: "https://code.visualstudio.com/docs",
        chatQuotaExceededContext: "",
        completionsQuotaExceededContext: "",
        walkthroughCommand: "",
        completionsMenuCommand: "",
        completionsRefreshTokenCommand: "",
        chatRefreshTokenCommand: "",
        generateCommitMessageCommand: "",
        resolveMergeConflictsCommand: "",
        completionsAdvancedSetting: "",
        completionsEnablementSetting: "",
        nextEditSuggestionsSetting: ""
      }
    },
    zoomLevel: 0,
    nls: { messages: [], language: "en" }
  };
}
__name(ResolveConfiguration, "ResolveConfiguration");
function ValidateIPCChannel(Channel) {
  if (!Channel || typeof Channel !== "string") return false;
  if (typeof navigator !== "undefined" && !Channel.startsWith("vscode:"))
    return false;
  return true;
}
__name(ValidateIPCChannel, "ValidateIPCChannel");
function Fallback() {
  if (typeof window.legacyBridge !== "undefined") {
    window.vscode = window.legacyBridge;
    return;
  }
  if (typeof window.vscode === "undefined") {
    window.vscode = {
      process: { platform: "web" },
      ipcRenderer: {
        send: /* @__PURE__ */ __name(() => {
        }, "send"),
        invoke: /* @__PURE__ */ __name(async () => ({}), "invoke"),
        on: /* @__PURE__ */ __name(() => ({}), "on"),
        once: /* @__PURE__ */ __name(() => ({}), "once"),
        removeListener: /* @__PURE__ */ __name(() => ({}), "removeListener"),
        removeAllListeners: /* @__PURE__ */ __name(() => {
        }, "removeAllListeners")
      }
    };
  }
}
__name(Fallback, "Fallback");
function InstallBrowserAPIPolyfills() {
  if (typeof window.requestIdleCallback !== "function") {
    console.log("[Wind] Installing requestIdleCallback polyfill...");
    window.requestIdleCallback = function(callback, options) {
      const timeout = options?.timeout ?? 1;
      const start = Date.now();
      const id = setTimeout(() => {
        const end = Date.now();
        const deadline = {
          didTimeout: timeout <= 0,
          timeRemaining: /* @__PURE__ */ __name(() => Math.max(0, timeout - (end - start)), "timeRemaining")
        };
        callback(deadline);
      }, timeout);
      return id;
    };
    console.log("[Wind]\u2001\u2713 requestIdleCallback polyfill installed");
  }
  if (typeof window.cancelIdleCallback !== "function") {
    console.log("[Wind] Installing cancelIdleCallback polyfill...");
    window.cancelIdleCallback = function(id) {
      clearTimeout(id);
    };
    console.log("[Wind]\u2001\u2713 cancelIdleCallback polyfill installed");
  }
}
__name(InstallBrowserAPIPolyfills, "InstallBrowserAPIPolyfills");
export {
  CreateIPCRenderer,
  CreateProcess,
  Fallback,
  ResolveConfiguration,
  ValidateIPCChannel,
  Install as default
};
//# sourceMappingURL=Install.js.map
