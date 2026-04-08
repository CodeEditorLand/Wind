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

	return {
		windowId: 1,
		appRoot: AppRoot,
		userEnv: {
			PATH: "/usr/bin:/bin",
			HOME: "/",
			VSCODE_DEV: "true",
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
		backupPath: undefined,
		workspace: undefined,
		fullscreen: false,
		policiesData: undefined,
		filesToOpenOrCreate: undefined,
		filesToDiff: undefined,
		filesToMerge: undefined,
		filesToWait: undefined,
		colorScheme: { dark: true, highContrast: false },
		autoDetectHighContrast: true,
		autoDetectColorScheme: false,
		isInitialStartup: false,
		perfMarks: [],
		accessibilitySupport: false,
	} as ISandboxConfiguration & Record<string, unknown>;
}
