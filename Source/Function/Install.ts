// Type imports for VSCode compatibility
import type { ISandboxConfiguration } from "@codeeditorland/output/vs/base/parts/sandbox/common/sandboxTypes";
import type {
	IpcRenderer,
	IpcRendererEvent,
} from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/electronTypes";
import type {
	IMainWindowSandboxGlobals,
	ISandboxNodeProcess,
} from "@codeeditorland/output/vs/base/parts/sandbox/electron-browser/globals";

/**
 * @module Install
 *
 * @description
 * Main entry point for Wind polyfill. Creates and attaches Electron API
 * shims to window.vscode that Electron workbench expects, using proper Tauri
 * integration and VSCode type compliance.
 *
 * @responsibilities
 * - Validates window context and prevents double initialization
 * - Creates VSCode-compatible globals with proper typing
 * - Handles Mountain backend communication with graceful degradation
 * - Implements Electron-like IPC subsystem with Tauri
 * - Provides comprehensive error handling and cleanup
 */
export default async function Install(): Promise<void> {
	try {
		// Validate window context
		if (typeof window === "undefined") {
			const error = new Error(
				"Cannot install Wind polyfill: window is not defined",
			);
			console.error(error);
			return;
		}

		// Prevent double initialization
		if (
			(window as unknown as { polyfillInstalled?: boolean })
				.polyfillInstalled
		) {
			return;
		}
		(
			window as unknown as { polyfillInstalled: boolean }
		).polyfillInstalled = true;

		console.log("[Wind] Starting Wind preload installation...");

		// Install browser API polyfills for VSCode compatibility
		InstallBrowserAPIPolyfills();

		// Initialize core components
		const Configuration = await ResolveConfiguration();
		const IPCRenderer = CreateIPCRenderer();
		const Process = CreateProcess(
			Configuration,
			CachedPlatform ?? undefined,
		);

		// Create preload globals object that will be enhanced by Effect-TS
		const preloadGlobals = {
			ipcRenderer: IPCRenderer,
			process: Process,
			configuration: Configuration,
		};

		// Attach preloadGlobals to window for Effect-TS services to access
		(window as any).preloadGlobals = preloadGlobals;
		console.log("[Wind] preloadGlobals attached to window");

		// Construct compliant VSCode API object
		const Globals: IMainWindowSandboxGlobals = {
			ipcRenderer: IPCRenderer,
			process: Process,
			context: {
				configuration: () => Configuration,
				resolveConfiguration: async () => Configuration,
			},
			webFrame: { setZoomLevel: () => {} },
			webUtils: { getPathForFile: (file: File) => file.name },
			ipcMessagePort: { acquire: () => {} },
		};

		// Attach to window
		(window as any).vscode = Globals;
		console.info(
			"[Wind] Successfully installed Electron API polyfill for workbench.",
		);

		// Signal that preload is ready for Effect-TS bootstrap
		(window as any).__WIND_PRELOAD_READY__ = true;
		console.log("[Wind] Preload ready, Effect-TS bootstrap can proceed");
	} catch (error: unknown) {
		console.error(`[Wind] Install error:`, error);
		Fallback();
	}
}

// IPCRenderer factory with proper VSCode typing
export function CreateIPCRenderer(): IpcRenderer {
	const self: IpcRenderer = {
		send: (Channel: string): void => {
			if (!ValidateIPCChannel(Channel)) return;
		},
		invoke: async (Channel: string): Promise<unknown> => {
			if (!ValidateIPCChannel(Channel)) {
				throw new Error(`Invalid IPC channel: ${Channel}`);
			}
			return {};
		},
		on: (
			_Channel: string,
			_Listener: (event: IpcRendererEvent) => void,
		): IpcRenderer => {
			return self;
		},
		once: (
			_Channel: string,
			_Listener: (event: IpcRendererEvent) => void,
		): IpcRenderer => {
			return self;
		},
		removeListener: (
			_Channel: string,
			_Listener: (event: IpcRendererEvent) => void,
		): IpcRenderer => {
			return self;
		},
	};
	return self;
}

// Process factory with proper VSCode typing
export function CreateProcess(
	Configuration: ISandboxConfiguration,
	Platform?: PlatformInfo,
): ISandboxNodeProcess {
	const P = Platform ??
		CachedPlatform ?? {
			platformName: "darwin" as const,
			os: { arch: "x86_64", release: "14.0", hostname: "localhost" },
			isWindows: false,
			isMacOS: true,
			isLinux: false,
			homeDir: "/",
			tmpDir: "/tmp",
			userDataDir: "/tmp/Land",
			userName: "User",
		};
	return {
		platform: P.platformName,
		arch: P.os.arch,
		type: "renderer",
		execPath: P.isWindows
			? "C:\\Program Files\\Land\\Land.exe"
			: "/usr/local/bin/land",
		env: Configuration.userEnv ?? {},
		cwd: () => P.homeDir,
		versions: {
			node: "20.0.0",
			chrome: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || "0",
			electron: "0.0.0",
		},
		on: (_Type: string, _Callback: Function): void => {},
		getProcessMemoryInfo: async () => ({
			private: 0,
			residentSet: 0,
			shared: 0,
		}),
		shellEnv: async () => ({}),
	};
}

// Platform detection — works from browser context (navigator.userAgent)
// or Node.js context (process.platform). Supports macOS, Windows, Linux.
interface PlatformInfo {
	isWindows: boolean;
	isMacOS: boolean;
	isLinux: boolean;
	platformName: "win32" | "darwin" | "linux";
	homeDir: string;
	tmpDir: string;
	userDataDir: string;
	userName: string;
	os: { release: string; hostname: string; arch: string };
}

let CachedPlatform: PlatformInfo | null = null;

async function DetectPlatform(): Promise<PlatformInfo> {
	if (CachedPlatform) return CachedPlatform;
	const UserAgent =
		typeof navigator !== "undefined" ? navigator.userAgent : "";
	const IsWindows =
		UserAgent.includes("Windows") ||
		(typeof process !== "undefined" && process.platform === "win32");
	const IsMacOS =
		UserAgent.includes("Macintosh") ||
		UserAgent.includes("Mac OS") ||
		(typeof process !== "undefined" && process.platform === "darwin");
	const IsLinux =
		(UserAgent.includes("Linux") && !UserAgent.includes("Android")) ||
		(typeof process !== "undefined" && process.platform === "linux");

	// Detect architecture from multiple sources
	const DetectArch = (): string => {
		// Check navigator.userAgentData (modern Chromium)
		if (typeof navigator !== "undefined" && "userAgentData" in navigator) {
			const HighEntropyHints = (navigator as any).userAgentData;
			if (HighEntropyHints?.architecture) {
				const Arch = HighEntropyHints.architecture;
				if (Arch === "arm") return "arm64";
				if (Arch === "x86") return "x86_64";
				return Arch;
			}
		}
		// Fall back to userAgent parsing
		if (
			UserAgent.includes("arm64") ||
			UserAgent.includes("ARM64") ||
			UserAgent.includes("aarch64")
		)
			return "arm64";
		if (
			UserAgent.includes("WOW64") ||
			UserAgent.includes("Win64") ||
			UserAgent.includes("x86_64") ||
			UserAgent.includes("x64")
		)
			return "x86_64";
		if (UserAgent.includes("i686") || UserAgent.includes("i386"))
			return "x86";
		// Process-level detection
		if (typeof process !== "undefined" && process.arch)
			return process.arch === "arm64"
				? "arm64"
				: process.arch === "ia32"
					? "x86"
					: "x86_64";
		return "x86_64";
	};

	// Detect OS release version
	const DetectRelease = (): string => {
		if (IsMacOS) {
			const Match = UserAgent.match(/Mac OS X (\d+[._]\d+[._]?\d*)/);
			return Match ? Match[1].replace(/_/g, ".") : "14.0";
		}
		if (IsWindows) {
			// Windows 11: "Windows NT 10.0" with build >= 22000
			// Windows 10: "Windows NT 10.0"
			const Match = UserAgent.match(/Windows NT (\d+\.\d+)/);
			return Match ? Match[1] : "10.0";
		}
		if (IsLinux) {
			// Linux kernel version not reliably in userAgent
			// Use a sensible default; Mountain will provide real value
			return "6.1.0";
		}
		return "0.0.0";
	};

	const Arch = DetectArch();
	const Release = DetectRelease();
	const PlatformName = IsWindows
		? ("win32" as const)
		: IsMacOS
			? ("darwin" as const)
			: ("linux" as const);

	// Platform-specific directories — try Tauri env first, then fallback
	let HomeDir: string;
	let TmpDir: string;
	let UserDataDir: string;
	let UserName = "User";

	// Try to get real home dir from Tauri (Mountain has the real env)
	const TauriInvoke =
		(window as any).__TAURI__?.core?.invoke ??
		(window as any).__TAURI__?.invoke;
	let RealEnv: Record<string, string> = {};
	if (typeof TauriInvoke === "function") {
		try {
			RealEnv = (await TauriInvoke("process_get_shell_env", {})) ?? {};
		} catch {
			// Tauri not ready yet — use fallbacks
		}
	}

	const RealHome = RealEnv["HOME"] || RealEnv["USERPROFILE"] || "";
	const RealUser = RealEnv["USER"] || RealEnv["USERNAME"] || "User";
	UserName = RealUser;

	if (IsWindows) {
		HomeDir = RealHome || "C:\\Users\\" + UserName;
		TmpDir =
			RealEnv["TEMP"] ||
			RealEnv["TMP"] ||
			HomeDir + "\\AppData\\Local\\Temp";
		UserDataDir =
			(RealEnv["APPDATA"] || HomeDir + "\\AppData\\Roaming") + "\\Land";
	} else if (IsMacOS) {
		HomeDir = RealHome || "/Users/" + UserName;
		TmpDir = "/tmp";
		UserDataDir = HomeDir + "/Library/Application Support/Land";
	} else {
		HomeDir = RealHome || "/home/" + UserName;
		TmpDir = "/tmp";
		UserDataDir =
			(RealEnv["XDG_CONFIG_HOME"] || HomeDir + "/.config") + "/Land";
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
			arch: Arch,
		},
	};
	return CachedPlatform;
}

// Configuration resolution with VSCode typing.
// Returns ISandboxConfiguration extended with INativeWindowConfiguration
// fields that the Electron workbench reads (appRoot, colorScheme, etc.).
// The browser workbench ignores the extra fields — additive only.
export async function ResolveConfiguration(): Promise<ISandboxConfiguration> {
	// Use pathname only — the Electron workbench passes appRoot through
	// fileUriFromPath which prepends vscode-file://. The Step 5 build
	// patch replaces that with a direct URL using _VSCODE_FILE_ROOT,
	// so appRoot is no longer used for URL computation. Keep it as a
	// clean path for any other code that reads it.
	const FileRoot = "/Static/Application/";

	const DefaultProfile = {
		id: "__default__profile__",
		isDefault: true,
		name: "Default",
		location: undefined,
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
		extensionsResource: undefined,
		cacheHome: {
			scheme: "vscode-userdata",
			path: "/User/cacheHome",
		},
	};

	const Platform = await DetectPlatform();

	return {
		windowId: 1,
		appRoot: FileRoot,
		userEnv: {
			PATH: Platform.isWindows
				? "C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem"
				: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
			HOME: Platform.homeDir,
			VSCODE_DEV: "true",
			...(Platform.isWindows
				? {
						USERPROFILE: Platform.homeDir,
						HOMEDRIVE: "C:",
						HOMEPATH: "\\Users\\" + (Platform.userName || "User"),
						SystemRoot: "C:\\Windows",
						TEMP: Platform.tmpDir,
						TMP: Platform.tmpDir,
					}
				: {}),
		},

		// INativeWindowConfiguration fields for Electron workbench
		mainPid: 0,
		machineId: "tauri-machine",
		sqmId: "",
		devDeviceId: "",
		isPortable: false,
		execPath: Platform.isWindows
			? "C:\\Program Files\\Land\\Land.exe"
			: "/usr/local/bin/land",
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
			profile: DefaultProfile,
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
	};
}

/**
 * Validates IPC channels with proper guard clauses
 */
export function ValidateIPCChannel(Channel: string): boolean {
	if (!Channel || typeof Channel !== "string") return false;
	if (typeof navigator !== "undefined" && !Channel.startsWith("vscode:"))
		return false;
	return true;
}

/**
 * Implements graceful degradation with fallback support
 */
export function Fallback(): void {
	if (typeof (window as any).legacyBridge !== "undefined") {
		(window as any).vscode = (window as any).legacyBridge;
		return;
	}
	if (typeof (window as any).vscode === "undefined") {
		(window as any).vscode = {
			process: { platform: "web" },
			ipcRenderer: {
				send: () => {},
				invoke: async () => ({}),
				on: () => ({}),
				once: () => ({}),
				removeListener: () => ({}),
				removeAllListeners: () => {},
			},
		};
	}
}

/**
 * Installs browser API polyfills that VSCode expects but may not be available
 * in all browser environments (particularly requestIdleCallback/cancelIdleCallback)
 */
function InstallBrowserAPIPolyfills(): void {
	// Polyfill for requestIdleCallback if not available
	if (typeof window.requestIdleCallback !== "function") {
		console.log("[Wind] Installing requestIdleCallback polyfill...");
		(window as any).requestIdleCallback = function (
			callback: IdleRequestCallback,
			options?: IdleRequestOptions,
		): number {
			// Fallback: use setTimeout with reasonable delay
			const timeout = options?.timeout ?? 1;
			const start = Date.now();
			const id = setTimeout(() => {
				const end = Date.now();
				const deadline: IdleDeadline = {
					didTimeout: timeout <= 0,
					timeRemaining: () => Math.max(0, timeout - (end - start)),
				};
				callback(deadline);
			}, timeout) as unknown as number;
			return id;
		};
		console.log("[Wind] ✓ requestIdleCallback polyfill installed");
	}

	// Polyfill for cancelIdleCallback if not available
	if (typeof window.cancelIdleCallback !== "function") {
		console.log("[Wind] Installing cancelIdleCallback polyfill...");
		(window as any).cancelIdleCallback = function (id: number): void {
			clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
		};
		console.log("[Wind] ✓ cancelIdleCallback polyfill installed");
	}
}

// This prevents compilation failures
declare const CrossFunctions: { CrossFunctions: any | Promise<any> };
