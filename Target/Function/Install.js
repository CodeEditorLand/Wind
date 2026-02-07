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
    fallback();
  }
}
__name(Install, "Install");
function createIpcRenderer() {
  const self = {
    send: /* @__PURE__ */ __name((channel) => {
      if (!validateIPCChannel(channel)) return;
    }, "send"),
    invoke: /* @__PURE__ */ __name(async (channel) => {
      if (!validateIPCChannel(channel)) {
        throw new Error(`Invalid IPC channel: ${channel}`);
      }
      return {};
    }, "invoke"),
    on: /* @__PURE__ */ __name((_channel, _listener) => {
      return self;
    }, "on"),
    once: /* @__PURE__ */ __name((_channel, _listener) => {
      return self;
    }, "once"),
    removeListener: /* @__PURE__ */ __name((_channel, _listener) => {
      return self;
    }, "removeListener")
  };
  return self;
}
__name(createIpcRenderer, "createIpcRenderer");
function createProcess(configuration) {
  return {
    platform: "web",
    arch: "web",
    type: "renderer",
    execPath: "/",
    env: configuration.userEnv ?? {},
    cwd: /* @__PURE__ */ __name(() => "/", "cwd"),
    versions: {
      node: "20.0.0",
      chrome: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || "0",
      electron: "0.0.0"
    },
    on: /* @__PURE__ */ __name((_type, _callback) => {
    }, "on"),
    getProcessMemoryInfo: /* @__PURE__ */ __name(async () => ({
      private: 0,
      residentSet: 0,
      shared: 0
    }), "getProcessMemoryInfo"),
    shellEnv: /* @__PURE__ */ __name(async () => ({}), "shellEnv")
  };
}
__name(createProcess, "createProcess");
async function ResolveConfiguration() {
  return {
    windowId: 1,
    appRoot: "file:///app",
    userEnv: { PATH: "/usr/bin:/bin", HOME: "/" },
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
function validateIPCChannel(channel) {
  if (!channel || typeof channel !== "string") return false;
  if (typeof navigator !== "undefined" && !channel.startsWith("vscode:"))
    return false;
  return true;
}
__name(validateIPCChannel, "validateIPCChannel");
function fallback() {
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
