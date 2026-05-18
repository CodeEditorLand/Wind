/**
 * @module Function/Install/Function/ResolveConfiguration
 * @description
 * Asynchronously resolves the VSCode sandbox configuration.
 * Provides default configuration values for the Tauri webview environment.
 *
 * @see {@link Function/Install/Function/Install} Main installation function
 * @category Function
 */

import type { ISandboxConfiguration } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/parts/sandbox/common/sandboxTypes.js";

const DevLog = (Tag: string, ..._Args: unknown[]): void => {
	try {
		performance.mark(`land:config:${Tag}`);
	} catch {}
};

/**
 * Atom I5: fetch the resolved /product.json generated at build time by
 * Maintain/Script/ResolveProductConfig.sh from .env.Land's Product* vars.
 * Single source of truth - no hardcoded identity or version strings here.
 * Network failures fall through to minimal defaults so the workbench still
 * boots in degraded mode (with a visible version mismatch warning).
 */
type LandProduct = {
	nameShort: string;

	nameLong: string;

	applicationName: string;

	dataFolderName: string;

	version: string;

	commit: string;

	quality?: string;

	urlProtocol: string;

	serverApplicationName: string;

	embedderIdentifier?: string;
};

const LoadProductJson = async (): Promise<LandProduct> => {
	const Base: LandProduct = {
		nameShort: "FIDDEE",

		nameLong: "FIDDEE",

		applicationName: "fiddee",

		dataFolderName: ".fiddee",

		version: "1.118.0",

		commit: "dev",

		urlProtocol: "fiddee",

		serverApplicationName: "fiddee-server",
	};

	try {
		const Response = await fetch("/product.json");

		if (Response.ok) {
			const Body = (await Response.json()) as Partial<LandProduct>;

			// exactOptionalPropertyTypes: only include optional keys if
			// the incoming value is a non-empty string. Undefined
			// assignments fail strict type-check.
			const Result: LandProduct = {
				nameShort: Body.nameShort ?? Base.nameShort,

				nameLong: Body.nameLong ?? Base.nameLong,

				applicationName: Body.applicationName ?? Base.applicationName,

				dataFolderName: Body.dataFolderName ?? Base.dataFolderName,

				version: Body.version ?? Base.version,

				commit: Body.commit ?? Base.commit,

				urlProtocol: Body.urlProtocol ?? Base.urlProtocol,

				serverApplicationName:
					Body.serverApplicationName ?? Base.serverApplicationName,
			};

			if (typeof Body.quality === "string") Result.quality = Body.quality;

			if (typeof Body.embedderIdentifier === "string")
				Result.embedderIdentifier = Body.embedderIdentifier;

			return Result;
		}

		DevLog("config", "product.json fetch non-ok:", Response.status);
	} catch (Error) {
		DevLog("config", "product.json fetch threw:", Error);
	}

	return Base;
};

/**
 * Resolves the VSCode sandbox configuration.
 * Returns ISandboxConfiguration (for browser workbench) but includes
 * additional fields that DesktopMain (INativeWindowConfiguration) reads.
 * The extra fields are silently ignored by the browser workbench.
 */
export async function ResolveConfiguration(): Promise<ISandboxConfiguration> {
	// Atom I5: resolve product identity from /product.json so every
	// consumer of this function gets the build-time-generated values.
	const Product = await LoadProductJson();

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

	// Pass Trace from Mountain environment to browser.
	if ((Paths as any).devLog) {
		(window as any).__Trace = (Paths as any).devLog;
	}

	// Read ?folder= from URL (set by pickFolderAndOpen navigation
	// + Mountain's `BuildInitialUrl` which sources from
	// `~/.land/workspaces/RecentlyOpened.json`'s top entry).
	const FolderParamRaw = new URLSearchParams(window.location.search).get(
		"folder",
	);

	// Defensive normalisation. RecentlyOpened.json stores workspace
	// URIs with a trailing slash (`file:///.../Mountain/`); after
	// `BuildInitialUrl` strips the `file://` prefix and percent-
	// encodes the path, the URL-decoded `?folder=` value still ends
	// in `/`. Constructing `URI{scheme:"file", path: ".../Mountain/"}`
	// produces `URI.fsPath === ".../Mountain/"` (with trailing slash)
	// which makes `IUriIdentityService.extUri.relativePath(workspaceFolder,
	// fileUri)` and `ILabelService.getUriLabel(uri, { relative: true })`
	// fail to compute relative paths on macOS APFS - the breadcrumb
	// then renders the absolute `/Volumes/<vol>/...` path instead of
	// the workspace-relative `Source > Foo > Bar` form. Strip a single
	// trailing slash so the workspace folder URI matches the file URIs
	// the workbench produces (which never carry a trailing slash on
	// the parent directory part).
	const FolderParam = FolderParamRaw
		? FolderParamRaw.replace(/\/+$/, "") || "/"
		: null;

	const FolderUri = FolderParam
		? { scheme: "file", path: FolderParam, authority: "" }
		: undefined;

	// ISingleFolderWorkspaceIdentifier for the Electron (desktop) workbench.
	// The browser workbench reads `folderUri` but DesktopMain reads `workspace`.
	// reviveIdentifier() in desktop.main.ts calls URI.revive() on workspace.uri.
	const Workspace =
		FolderUri && FolderParam
			? {
					id: Array.from(FolderParam)
						.reduce(
							(Hash, Character) =>
								((Hash << 5) - Hash + Character.charCodeAt(0)) |
								0,

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
	// Use it directly - no additional timestamp nesting needed.
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
			// Atom I5: every field below is sourced from /product.json
			// (generated from .env.Land at build time). See LoadProductJson.
			nameShort: Product.nameShort,

			nameLong: Product.nameLong,

			applicationName: Product.applicationName,

			version: Product.version,

			commit: Product.commit,

			date: new Date().toISOString(),

			urlProtocol: Product.urlProtocol,

			dataFolderName: Product.dataFolderName,

			serverApplicationName: Product.serverApplicationName,

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

		// Extension paths - tells VS Code's NativeExtensionsScannerService where
		// to find built-in and user-installed extensions on disk.
		// appRoot + /extensions = builtinExtensionsPath (VS Code convention)
		builtinExtensionsPath: `${AppRoot}/extensions`,

		extensionsPath: Paths.userDataDir
			? `${Paths.userDataDir}/extensions`
			: undefined,

		// Workspace - set from ?folder= URL param
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
