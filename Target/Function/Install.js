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
    const Process = CreateProcess(Configuration, CachedPlatform ?? void 0);
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
function CreateProcess(Configuration, Platform) {
  const P = Platform ?? CachedPlatform ?? { platformName: "darwin", os: { arch: "x86_64", release: "14.0", hostname: "localhost" }, isWindows: false, isMacOS: true, isLinux: false, homeDir: "/", tmpDir: "/tmp", userDataDir: "/tmp/Land", userName: "User" };
  return {
    platform: P.platformName,
    arch: P.os.arch,
    type: "renderer",
    execPath: P.isWindows ? "C:\\Program Files\\Land\\Land.exe" : "/usr/local/bin/land",
    env: Configuration.userEnv ?? {},
    cwd: /* @__PURE__ */ __name(() => P.homeDir, "cwd"),
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
let CachedPlatform = null;
async function DetectPlatform() {
  if (CachedPlatform) return CachedPlatform;
  const UserAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const IsWindows = UserAgent.includes("Windows") || typeof process !== "undefined" && process.platform === "win32";
  const IsMacOS = UserAgent.includes("Macintosh") || UserAgent.includes("Mac OS") || typeof process !== "undefined" && process.platform === "darwin";
  const IsLinux = UserAgent.includes("Linux") && !UserAgent.includes("Android") || typeof process !== "undefined" && process.platform === "linux";
  const DetectArch = /* @__PURE__ */ __name(() => {
    if (typeof navigator !== "undefined" && "userAgentData" in navigator) {
      const HighEntropyHints = navigator.userAgentData;
      if (HighEntropyHints?.architecture) {
        const Arch2 = HighEntropyHints.architecture;
        if (Arch2 === "arm") return "arm64";
        if (Arch2 === "x86") return "x86_64";
        return Arch2;
      }
    }
    if (UserAgent.includes("arm64") || UserAgent.includes("ARM64") || UserAgent.includes("aarch64")) return "arm64";
    if (UserAgent.includes("WOW64") || UserAgent.includes("Win64") || UserAgent.includes("x86_64") || UserAgent.includes("x64")) return "x86_64";
    if (UserAgent.includes("i686") || UserAgent.includes("i386")) return "x86";
    if (typeof process !== "undefined" && process.arch) return process.arch === "arm64" ? "arm64" : process.arch === "ia32" ? "x86" : "x86_64";
    return "x86_64";
  }, "DetectArch");
  const DetectRelease = /* @__PURE__ */ __name(() => {
    if (IsMacOS) {
      const Match = UserAgent.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
      return Match ? Match[1].replace(/_/g, ".") : "14.0";
    }
    if (IsWindows) {
      const Match = UserAgent.match(/Windows NT (\d+\.\d+)/);
      return Match ? Match[1] : "10.0";
    }
    if (IsLinux) {
      return "6.1.0";
    }
    return "0.0.0";
  }, "DetectRelease");
  const Arch = DetectArch();
  const Release = DetectRelease();
  const PlatformName = IsWindows ? "win32" : IsMacOS ? "darwin" : "linux";
  let HomeDir;
  let TmpDir;
  let UserDataDir;
  let UserName = "User";
  const TauriInvoke = window.__TAURI__?.core?.invoke ?? window.__TAURI__?.invoke;
  let RealEnv = {};
  if (typeof TauriInvoke === "function") {
    try {
      RealEnv = await TauriInvoke("process_get_shell_env", {}) ?? {};
    } catch {
    }
  }
  const RealHome = RealEnv["HOME"] || RealEnv["USERPROFILE"] || "";
  const RealUser = RealEnv["USER"] || RealEnv["USERNAME"] || "User";
  UserName = RealUser;
  if (IsWindows) {
    HomeDir = RealHome || "C:\\Users\\" + UserName;
    TmpDir = RealEnv["TEMP"] || RealEnv["TMP"] || HomeDir + "\\AppData\\Local\\Temp";
    UserDataDir = (RealEnv["APPDATA"] || HomeDir + "\\AppData\\Roaming") + "\\Land";
  } else if (IsMacOS) {
    HomeDir = RealHome || "/Users/" + UserName;
    TmpDir = "/tmp";
    UserDataDir = HomeDir + "/Library/Application Support/Land";
  } else {
    HomeDir = RealHome || "/home/" + UserName;
    TmpDir = "/tmp";
    UserDataDir = (RealEnv["XDG_CONFIG_HOME"] || HomeDir + "/.config") + "/Land";
  }
  CachedPlatform = {
    isWindows: IsWindows,
    isMacOS: IsMacOS,
    isLinux: IsLinux,
    platformName: PlatformName,
    homeDir: HomeDir,
    tmpDir: TmpDir,
    userDataDir: UserDataDir,
    userName: UserName,
    os: {
      release: Release,
      hostname: "localhost",
      arch: Arch
    }
  };
  return CachedPlatform;
}
__name(DetectPlatform, "DetectPlatform");
async function ResolveConfiguration() {
  const FileRoot = "/Static/Application/";
  const DefaultProfile = {
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
  };
  const Platform = await DetectPlatform();
  return {
    windowId: 1,
    appRoot: FileRoot,
    userEnv: {
      PATH: Platform.isWindows ? "C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem" : "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
      HOME: Platform.homeDir,
      VSCODE_DEV: "true",
      ...Platform.isWindows ? {
        USERPROFILE: Platform.homeDir,
        HOMEDRIVE: "C:",
        HOMEPATH: "\\Users\\" + (Platform.userName || "User"),
        SystemRoot: "C:\\Windows",
        TEMP: Platform.tmpDir,
        TMP: Platform.tmpDir
      } : {}
    },
    // INativeWindowConfiguration fields for Electron workbench
    mainPid: 0,
    machineId: "tauri-machine",
    sqmId: "",
    devDeviceId: "",
    isPortable: false,
    execPath: Platform.isWindows ? "C:\\Program Files\\Land\\Land.exe" : "/usr/local/bin/land",
    homeDir: Platform.homeDir,
    tmpDir: Platform.tmpDir,
    userDataDir: Platform.userDataDir,
    logLevel: 2,
    loggers: [],
    perfMarks: [],
    os: Platform.os,
    colorScheme: { dark: true, highContrast: false },
    autoDetectHighContrast: false,
    autoDetectColorScheme: false,
    profiles: {
      home: { scheme: "vscode-userdata", path: "/User" },
      all: [DefaultProfile],
      profile: DefaultProfile
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
