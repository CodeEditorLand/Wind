var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const DevLog = /* @__PURE__ */ __name((Tag, ..._Args) => {
  try {
    performance.mark(`land:config:${Tag}`);
  } catch {
  }
}, "DevLog");
async function ResolveConfiguration() {
  const FileRoot = typeof globalThis._VSCODE_FILE_ROOT === "string" ? globalThis._VSCODE_FILE_ROOT : "/Static/Application/";
  const AppRoot = FileRoot.replace(/^https?:\/\/[^/]+/, "");
  let Paths = { userDataDir: "", logsPath: "", homeDir: "/", tmpDir: "/tmp" };
  try {
    const Invoke = window.__TAURI__?.core?.invoke ?? window.__TAURI__?.invoke;
    if (typeof Invoke === "function") {
      Paths = await Invoke("MountainIPCInvoke", {
        method: "nativeHost:getEnvironmentPaths",
        params: []
      });
    }
  } catch (Error2) {
    DevLog("config", "MountainIPCInvoke failed:", Error2);
  }
  DevLog("config", "paths:", JSON.stringify(Paths));
  if (Paths.devLog) {
    window.__LAND_DEV_LOG = Paths.devLog;
  }
  const FolderParam = new URLSearchParams(window.location.search).get(
    "folder"
  );
  const FolderUri = FolderParam ? { scheme: "file", path: FolderParam, authority: "" } : void 0;
  const Workspace = FolderUri ? {
    id: Array.from(FolderParam).reduce(
      (Hash, Character) => (Hash << 5) - Hash + Character.charCodeAt(0) | 0,
      0
    ).toString(16).replace("-", ""),
    uri: FolderUri
  } : void 0;
  DevLog("config", "url:", window.location.href);
  DevLog("config", "folderUri:", JSON.stringify(FolderUri));
  DevLog("config", "workspace:", JSON.stringify(Workspace));
  const LogsLocation = Paths.logsPath || void 0;
  return {
    windowId: 1,
    appRoot: AppRoot,
    userEnv: {
      PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
      HOME: Paths.homeDir || "/",
      VSCODE_DEV: "true",
      USER: Paths.homeDir?.split("/").pop() || "user"
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
    nls: { messages: [], language: "en" },
    // Desktop-specific fields (INativeWindowConfiguration)
    // These are read by DesktopMain.initServices() and must exist
    // to prevent crashes on property access.
    logLevel: void 0,
    loggers: [],
    profiles: {
      home: { scheme: "vscode-userdata", path: "/User" },
      all: [
        {
          id: "__default__profile__",
          name: "Default",
          isDefault: true,
          location: {
            scheme: "vscode-userdata",
            path: "/User/profiles/__default__profile__"
          },
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
          promptsHome: {
            scheme: "vscode-userdata",
            path: "/User/prompts"
          },
          extensionsResource: {
            scheme: "vscode-userdata",
            path: "/User/extensions.json"
          },
          mcpResource: {
            scheme: "vscode-userdata",
            path: "/User/mcp.json"
          },
          cacheHome: {
            scheme: "vscode-userdata",
            path: "/User/caches"
          }
        }
      ],
      profile: {
        id: "__default__profile__",
        name: "Default",
        isDefault: true,
        location: {
          scheme: "vscode-userdata",
          path: "/User/profiles/__default__profile__"
        },
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
        promptsHome: {
          scheme: "vscode-userdata",
          path: "/User/prompts"
        },
        extensionsResource: {
          scheme: "vscode-userdata",
          path: "/User/extensions.json"
        },
        mcpResource: {
          scheme: "vscode-userdata",
          path: "/User/mcp.json"
        },
        cacheHome: {
          scheme: "vscode-userdata",
          path: "/User/caches"
        }
      }
    },
    os: { release: "24.0.0" },
    // Real paths from Mountain (Tauri PathResolver).
    // VS Code's AbstractNativeEnvironmentService wraps these with URI.file(),
    // so they must be plain filesystem paths (not file:// URIs).
    homeDir: Paths.homeDir || void 0,
    tmpDir: Paths.tmpDir || void 0,
    userDataDir: Paths.userDataDir || void 0,
    logsPath: LogsLocation || void 0,
    // Workspace — set from ?folder= URL param
    // folderUri is used by the browser workbench; workspace by the Electron workbench.
    folderUri: FolderUri,
    workspace: Workspace,
    backupPath: void 0,
    fullscreen: false,
    policiesData: void 0,
    filesToOpenOrCreate: void 0,
    filesToDiff: void 0,
    filesToMerge: void 0,
    filesToWait: void 0,
    colorScheme: { dark: true, highContrast: false },
    autoDetectHighContrast: true,
    autoDetectColorScheme: false,
    isInitialStartup: !FolderParam,
    perfMarks: [],
    accessibilitySupport: false
  };
}
__name(ResolveConfiguration, "ResolveConfiguration");
export {
  ResolveConfiguration
};
//# sourceMappingURL=ResolveConfiguration.js.map
