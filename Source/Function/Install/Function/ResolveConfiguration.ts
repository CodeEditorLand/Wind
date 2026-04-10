/**
 * @module Function/Install/Function/ResolveConfiguration
 * @description
 * Asynchronously resolves the VSCode sandbox configuration.
 * Provides default configuration values for the Tauri webview environment.
 *
 * @see {@link Function/Install/Function/Install} Main installation function
 * @category Function
 */

import type { ISandboxConfiguration } from "@codeeditorland/output/vs/base/parts/sandbox/common/sandboxTypes";

import DevLog from "../../DevLog.js";

/**
 * Resolves the VSCode sandbox configuration.
 * Returns ISandboxConfiguration (for browser workbench) but includes
 * additional fields that DesktopMain (INativeWindowConfiguration) reads.
 * The extra fields are silently ignored by the browser workbench.
 */
export async function ResolveConfiguration(): Promise<ISandboxConfiguration> {
	const FileRoot =
		typeof globalThis._VSCODE_FILE_ROOT === "string"
			? globalThis._VSCODE_FILE_ROOT
			: "/Static/Application/";

	// Strip origin from FileRoot for appRoot (workbench.js prepends vscode-file://)
	const AppRoot = FileRoot.replace(/^https?:\/\/[^/]+/, "");

	// Fetch real Tauri paths from Mountain
	let Paths = { userDataDir: "", logsPath: "", homeDir: "/", tmpDir: "/tmp" };
	try {
		const Invoke =
			(window as any).__TAURI__?.core?.invoke ??
			(window as any).__TAURI__?.invoke;
		if (typeof Invoke === "function") {
			Paths = await Invoke("MountainIPCInvoke", {
				method: "nativeHost:getEnvironmentPaths",
				params: [],
			});
		}
	} catch (Error) {
		DevLog("config", "MountainIPCInvoke failed:", Error);
	}

	DevLog("config", "paths:", JSON.stringify(Paths));

	// Pass LAND_DEV_LOG from Mountain environment to browser.
	// The Tauri IPC returns the env var; set it on window so DevLog picks it up.
	if ((Paths as any).devLog) {
		(window as any).__LAND_DEV_LOG = (Paths as any).devLog;
		DevLog.reset();
	}

	// Read ?folder= from URL (set by pickFolderAndOpen navigation)
	const FolderParam = new URLSearchParams(window.location.search).get(
		"folder",
	);
	const FolderUri = FolderParam
		? { scheme: "file", path: FolderParam, authority: "" }
		: undefined;

	// ISingleFolderWorkspaceIdentifier for the Electron (desktop) workbench.
	// The browser workbench reads `folderUri` but DesktopMain reads `workspace`.
	// reviveIdentifier() in desktop.main.ts calls URI.revive() on workspace.uri.
	const Workspace = FolderUri
		? {
				id: Array.from(FolderParam)
					.reduce(
						(Hash, Character) =>
							((Hash << 5) - Hash + Character.charCodeAt(0)) | 0,
						0,
					)
					.toString(16)
					.replace("-", ""),
				uri: FolderUri,
			}
		: undefined;

	DevLog("config", "url:", window.location.href);
	DevLog("config", "folderUri:", JSON.stringify(FolderUri));
	DevLog("config", "workspace:", JSON.stringify(Workspace));

	// Mountain returns logsPath as a session-timestamped directory
	// (e.g., .../logs/20260410T105248) with window1/ already created.
	// Use it directly — no additional timestamp nesting needed.
	const LogsLocation = Paths.logsPath || undefined;

	return {
		windowId: 1,
		appRoot: AppRoot,
		userEnv: {
			PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
			HOME: Paths.homeDir || "/",
			VSCODE_DEV: "true",
			USER: Paths.homeDir?.split("/").pop() || "user",
		},
		product: {
			nameShort: "VSCode Wind",
			nameLong: "VSCode Wind",
			applicationName: "vscode-wind",
			version: "0.0.1",
			commit: "dev",
			date: new Date().toISOString(),
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
					apple: { id: "apple", name: "Apple" },
				},
				providerUriSetting: "ai.provider.uri",
				providerScopes: [["read"], ["write"]],
				entitlementUrl: "https://code.visualstudio.com/docs",
				entitlementSignupLimitedUrl:
					"https://code.visualstudio.com/docs",
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
				nextEditSuggestionsSetting: "",
			},
		},
		zoomLevel: 0,
		nls: { messages: [], language: "en" },

		// Desktop-specific fields (INativeWindowConfiguration)
		// These are read by DesktopMain.initServices() and must exist
		// to prevent crashes on property access.
		logLevel: undefined,
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
						path: "/User/profiles/__default__profile__",
					},
					globalStorageHome: {
						scheme: "vscode-userdata",
						path: "/User/globalStorage",
					},
					settingsResource: {
						scheme: "vscode-userdata",
						path: "/User/settings.json",
					},
					keybindingsResource: {
						scheme: "vscode-userdata",
						path: "/User/keybindings.json",
					},
					tasksResource: {
						scheme: "vscode-userdata",
						path: "/User/tasks.json",
					},
					snippetsHome: {
						scheme: "vscode-userdata",
						path: "/User/snippets",
					},
					promptsHome: {
						scheme: "vscode-userdata",
						path: "/User/prompts",
					},
					extensionsResource: {
						scheme: "vscode-userdata",
						path: "/User/extensions.json",
					},
					mcpResource: {
						scheme: "vscode-userdata",
						path: "/User/mcp.json",
					},
					cacheHome: {
						scheme: "vscode-userdata",
						path: "/User/caches",
					},
				},
			],
			profile: {
				id: "__default__profile__",
				name: "Default",
				isDefault: true,
				location: {
					scheme: "vscode-userdata",
					path: "/User/profiles/__default__profile__",
				},
				globalStorageHome: {
					scheme: "vscode-userdata",
					path: "/User/globalStorage",
				},
				settingsResource: {
					scheme: "vscode-userdata",
					path: "/User/settings.json",
				},
				keybindingsResource: {
					scheme: "vscode-userdata",
					path: "/User/keybindings.json",
				},
				tasksResource: {
					scheme: "vscode-userdata",
					path: "/User/tasks.json",
				},
				snippetsHome: {
					scheme: "vscode-userdata",
					path: "/User/snippets",
				},
				promptsHome: {
					scheme: "vscode-userdata",
					path: "/User/prompts",
				},
				extensionsResource: {
					scheme: "vscode-userdata",
					path: "/User/extensions.json",
				},
				mcpResource: {
					scheme: "vscode-userdata",
					path: "/User/mcp.json",
				},
				cacheHome: {
					scheme: "vscode-userdata",
					path: "/User/caches",
				},
			},
		},
		os: { release: "24.0.0" },

		// Real paths from Mountain (Tauri PathResolver).
		// VS Code's AbstractNativeEnvironmentService wraps these with URI.file(),
		// so they must be plain filesystem paths (not file:// URIs).
		homeDir: Paths.homeDir || undefined,
		tmpDir: Paths.tmpDir || undefined,
		userDataDir: Paths.userDataDir || undefined,
		logsPath: LogsLocation || undefined,

		// Workspace — set from ?folder= URL param
		// folderUri is used by the browser workbench; workspace by the Electron workbench.
		folderUri: FolderUri,
		workspace: Workspace,
		backupPath: undefined,
		fullscreen: false,
		policiesData: undefined,
		filesToOpenOrCreate: undefined,
		filesToDiff: undefined,
		filesToMerge: undefined,
		filesToWait: undefined,
		colorScheme: { dark: true, highContrast: false },
		autoDetectHighContrast: true,
		autoDetectColorScheme: false,
		isInitialStartup: !FolderParam,
		perfMarks: [],
		accessibilitySupport: false,
	} as unknown as ISandboxConfiguration & Record<string, unknown>;
}
