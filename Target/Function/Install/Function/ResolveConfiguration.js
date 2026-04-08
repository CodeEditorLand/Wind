var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function ResolveConfiguration() {
  const FileRoot = typeof globalThis._VSCODE_FILE_ROOT === "string" ? globalThis._VSCODE_FILE_ROOT : "/Static/Application/";
  const AppRoot = FileRoot.replace(/^https?:\/\/[^/]+/, "");
  return {
    windowId: 1,
    appRoot: AppRoot,
    userEnv: {
      PATH: "/usr/bin:/bin",
      HOME: "/",
      VSCODE_DEV: "true"
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
    backupPath: void 0,
    workspace: void 0,
    fullscreen: false,
    policiesData: void 0,
    filesToOpenOrCreate: void 0,
    filesToDiff: void 0,
    filesToMerge: void 0,
    filesToWait: void 0,
    colorScheme: { dark: true, highContrast: false },
    autoDetectHighContrast: true,
    autoDetectColorScheme: false,
    isInitialStartup: false,
    perfMarks: [],
    accessibilitySupport: false
  };
}
__name(ResolveConfiguration, "ResolveConfiguration");
export {
  ResolveConfiguration
};
//# sourceMappingURL=ResolveConfiguration.js.map
