/*
 * File: Wind/Source/Bridge.ts
 * Role: Sky Host Compatibility Bridge
 * Responsibilities:
 *   - This script runs in the Sky webview (the client-side of the Astro-based
 *     application) at a very early stage of its lifecycle, before the main
 *     VS Code workbench script is loaded.
 *   - Its primary purpose is to create and expose a global object, `window.vscode`,
 *     which shims the essential APIs, properties, and behaviors that VS Code's
 *     sandboxed workbench code expects from an Electron environment.
 *   - It translates IPC requests to use Tauri's `invoke` and event system, with
 *     the 'Mountain' (Tauri Rust backend) acting as the main process.
 *   - It provides a fallback configuration to allow the workbench to load in a
 *     degraded state if the Mountain backend is unavailable.
 */

// --- Tauri API Imports ---
import {
	listen as TauriListen,
	type Event as TauriEvent,
	type UnlistenFn,
} from "@tauri-apps/api/event";
import { invoke as TauriInvoke } from "@tauri-apps/api/tauri";
// --- VS Code Utility Imports ---
import { URI } from "vs/base/common/uri.js";
import { generateUuid } from "vs/base/common/uuid.js";
import { LogLevel } from "vs/platform/log/common/log.js";

// --- Type Definitions for Shims ---

/**
 * A shim for the `ipcRenderer` event object.
 */
interface IpcRendererEventShim {
	readonly sender: IpcRendererShim;
}

/**
 * A shim for the `ipcRenderer` object, adapting it to use Tauri's IPC.
 */
interface IpcRendererShim {
	readonly send: (Channel: string, ...Args: any[]) => void;
	readonly invoke: (Channel: string, ...Args: any[]) => Promise<any>;
	readonly on: (
		Channel: string,
		Listener: (Event: IpcRendererEventShim, ...Args: any[]) => void,
	) => this;
	readonly once: (
		Channel: string,
		Listener: (Event: IpcRendererEventShim, ...Args: any[]) => void,
	) => this;
	readonly removeListener: (
		Channel: string,
		Listener: (Event: IpcRendererEventShim, ...Args: any[]) => void,
	) => this;
}

/**
 * A shim for the `ipcMessagePort` object.
 */
interface IpcMessagePortShim {
	readonly acquire: (ResponseChannel: string, Nonce: string) => void;
}

/**
 * A shim for the `webFrame` object.
 */
interface WebFrameShim {
	readonly setZoomLevel: (Level: number) => void;
	readonly getZoomLevel: () => number;
}

/**
 * A shim for the Node.js `process` object.
 */
interface ProcessShim {
	readonly platform: "win32" | "linux" | "darwin";
	readonly arch: "x64" | "arm64" | "ia32";
	readonly env: Record<string, string | undefined>;
	readonly versions: Record<string, string | undefined>;
	readonly type: "renderer";
	readonly execPath: string;
	readonly sandboxed: true;
	readonly contextIsolated: boolean;
	readonly आटा: boolean; // isNsfw / devMode (maps to nodeCachedDataEnabled())
	readonly resourcesPath: string; // Filesystem path
	readonly mas?: boolean;
	readonly windowsStore?: boolean;
	readonly linuxManualInstall?: boolean;
	readonly cwd: () => string;
	readonly shellEnv: () => Promise<Record<string, string | undefined>>;
	readonly getProcessMemoryInfo: () => Promise<{
		privateBytes: number;
		sharedBytes: number;
		residentSet: number;
	}>;
	readonly on: (
		Type: "uncaughtException",
		Callback: (Error: Error) => void,
	) => void;
}

/**
 * A shim for the `context` object providing configuration.
 */
interface ContextShim {
	readonly configuration: () => ISandboxConfiguration | undefined;
	readonly resolveConfiguration: () => Promise<ISandboxConfiguration>;
}

/**
 * A shim for the `webUtils` object.
 */
interface WebUtilsShim {
	readonly getPathForFile: (File: File) => string;
}

/**
 * The structure of the VS Code sandbox configuration object.
 */
interface ISandboxConfiguration {
	readonly windowId: number;
	readonly machineId: string;
	readonly sqmId?: string;
	readonly sessionId: string;
	readonly logLevel: LogLevel;
	readonly userEnv: Record<string, string | undefined>;
	readonly appRoot: string; // URI string
	readonly appName: string;
	readonly appUriScheme: string;
	readonly appLanguage: string;
	readonly appHost: "desktop" | "web" | "codespaces" | string;
	readonly productQuality?: string;
	readonly platform: ProcessShim["platform"];
	readonly arch: ProcessShim["arch"];
	readonly versions: ProcessShim["versions"];
	readonly execPath: string; // Filesystem path
	readonly zoomLevel?: number;
	readonly homeDir: string; // URI string
	readonly tmpDir: string; // URI string
	readonly userDataDir: string; // URI string
	readonly backupPath?: string; // URI string
	readonly crashReporterId?: string;
	readonly nls: {
		readonly messages: Record<string, string>;
		readonly language: string;
		readonly availableLanguages: Record<string, string>;
		readonly pseudo?: boolean;
	};
	readonly productConfiguration: { readonly [Key: string]: any };
	readonly VSCODE_CWD?: string; // Filesystem path
	readonly resourcesPath: string; // Filesystem path
	readonly [Key: string]: any;
}

// --- Global State for the Bridge ---

let ResolvedConfigurationCache: ISandboxConfiguration | undefined = undefined;
let ResolveConfigurationPromise: Promise<ISandboxConfiguration> | null = null;
const TauriListenerMap = new Map<
	string,
	Map<Function, UnlistenFn | Promise<UnlistenFn>>
>();

// --- Helper Functions ---

/**
 * Generates a fallback `ISandboxConfiguration` object when the Mountain backend is unavailable.
 * This allows the workbench to attempt to load, though with limited functionality.
 * @returns A fallback `ISandboxConfiguration` object.
 */
function GetFallbackSandboxConfiguration(): ISandboxConfiguration {
	console.warn(
		"[Sky Host Bridge] CRITICAL: Constructing fallback ISandboxConfiguration. Mountain backend did not provide configuration. Workbench functionality will be SEVERELY limited or broken.",
	);

	const FallbackMachineId = generateUuid();
	const FallbackSessionId = generateUuid();
	const FallbackOrigin =
		typeof window !== "undefined" ? window.location.origin : "file://";
	const FallbackAppRootFromGlobal = (globalThis as any)._VSCODE_FILE_ROOT;
	const FallbackAppRoot = FallbackAppRootFromGlobal
		? FallbackAppRootFromGlobal.startsWith("file://")
			? FallbackAppRootFromGlobal
			: `file://${FallbackAppRootFromGlobal}`
		: `${FallbackOrigin}/Static/Application/`;

	console.warn(
		`[Sky Host Bridge] Using fallback appRoot (URI string): ${FallbackAppRoot}.`,
	);

	const NavPlatform =
		typeof navigator !== "undefined"
			? navigator.platform.toLowerCase()
			: "";
	const DerivedPlatform: ProcessShim["platform"] = NavPlatform.includes("mac")
		? "darwin"
		: NavPlatform.includes("win")
			? "win32"
			: "linux";

	let DerivedArch: ProcessShim["arch"] = "x64";
	if (
		typeof navigator !== "undefined" &&
		(navigator as any).userAgentData?.architecture
	) {
		const NavArch = (navigator as any).userAgentData.architecture;
		if (NavArch === "arm" || NavArch === "aarch64") {
			DerivedArch = "arm64";
		}
	}

	const DerivedVersions: Record<string, string | undefined> = {
		fiddee: (window as any).FIDDEE_VERSION || "0.0.0-fallback",
		webview_runtime:
			navigator.userAgent.match(
				/(Chrome|Firefox|Safari|Edge?)\/([\d.]+)/,
			)?.[0] || "unknown",
	};

	const FallbackHomeDir = `file:///home/fallback_user_${generateUuid()}`;
	const FallbackResourcesPath = "/app/fallback_resources";

	return {
		windowId: Math.floor(Math.random() * 100000) + 1,
		machineId: FallbackMachineId,
		sessionId: FallbackSessionId,
		logLevel: LogLevel.Info,
		userEnv: { FALLBACK_MODE: "true" },
		appRoot: FallbackAppRoot,
		appName: "FIDDEE (Fallback Mode)",
		appUriScheme: "fiddee-fallback",
		appLanguage:
			(typeof navigator !== "undefined" ? navigator.language : "en") ||
			"en",
		appHost: "desktop",
		productQuality: "development",
		platform: DerivedPlatform,
		arch: DerivedArch,
		versions: DerivedVersions,
		execPath: "/app/FIDDEE_fallback_executable",
		homeDir: FallbackHomeDir,
		tmpDir: `file:///tmp/fallback_${generateUuid()}`,
		userDataDir: `file:///app/user_data_fallback_${generateUuid()}`,
		backupPath: `file:///app/backup_fallback_${generateUuid()}`,
		nls: {
			messages: {},
			language:
				(typeof navigator !== "undefined"
					? navigator.language
					: "en") || "en",
			availableLanguages: { en: "English" },
		},
		productConfiguration: {
			nameShort: "FIDDEE-FB",
			nameLong: "FIDDEE Fallback",
			applicationName: "fiddee-fallback",
			embedderIdentifier: "fiddee-desktop-fallback",
		},
		resourcesPath: FallbackResourcesPath,
		VSCODE_CWD: "/app/fallback_cwd",
		zoomLevel: 0,
		crashReporterId: `fallback_uuid_${generateUuid()}`,
		sqmId: `fallback_sqm_${generateUuid()}`,
	};
}

/**
 * Validates that an IPC channel name is correctly formatted.
 * @param Channel - The channel name to validate.
 * @param AllowNonPrefixed - Whether to allow channels that don't start with 'vscode:'.
 * @returns `true` if the channel is valid, `false` otherwise.
 */
function ValidateIPCChannel(
	Channel: string,
	AllowNonPrefixed = false,
): boolean {
	if (!Channel) {
		console.error(
			"[Sky Host Bridge] Invalid IPC channel: Channel name is falsy.",
		);
		return false;
	}
	if (!AllowNonPrefixed && !Channel.startsWith("vscode:")) {
		console.error(
			`[Sky Host Bridge] Invalid IPC channel: '${Channel}'. Channels MUST start with 'vscode:'.`,
		);
		return false;
	}
	return true;
}

// --- Shim Implementations ---

const IpcRendererShimInstance: IpcRendererShim = {
	send: (Channel: string, ...Args: any[]): void => {
		if (!ValidateIPCChannel(Channel)) return;
		TauriInvoke("mountain_ipc_bridge_send", {
			Channel,
			ArgsList: Args,
		}).catch((Error: any) =>
			console.error(
				`[Sky Host Bridge] Error in ipcRenderer.send for channel '${Channel}':`,
				Error,
			),
		);
	},

	invoke: async (Channel: string, ...Args: any[]): Promise<any> => {
		if (!ValidateIPCChannel(Channel)) {
			return Promise.reject(new Error(`Invalid IPC channel: ${Channel}`));
		}
		try {
			return await TauriInvoke("mountain_ipc_bridge_invoke", {
				Channel,
				ArgsList: Args,
			});
		} catch (Error) {
			console.error(
				`[Sky Host Bridge] Error in ipcRenderer.invoke for channel '${Channel}':`,
				Error,
			);
			throw Error;
		}
	},

	on: (
		Channel: string,
		Listener: (Event: IpcRendererEventShim, ...Args: any[]) => void,
	): IpcRendererShim => {
		const AllowNonStandardPrefix = Channel === "message";
		if (!ValidateIPCChannel(Channel, AllowNonStandardPrefix))
			return IpcRendererShimInstance;

		const ChannelListeners =
			TauriListenerMap.get(Channel) ||
			new Map<Function, UnlistenFn | Promise<UnlistenFn>>();
		TauriListenerMap.set(Channel, ChannelListeners);

		if (ChannelListeners.has(Listener)) {
			console.warn(
				`[Sky Host Bridge] Listener already registered for channel '${Channel}'.`,
			);
			return IpcRendererShimInstance;
		}

		const TauriUnlistenPromise: Promise<UnlistenFn> = TauriListen(
			Channel,
			(TauriEvent: TauriEvent<any[]>) => {
				const EventShim: IpcRendererEventShim = {
					sender: IpcRendererShimInstance,
				};
				try {
					Listener(EventShim, ...(TauriEvent.payload || []));
				} catch (ErrorInListener) {
					console.error(
						`[Sky Host Bridge] Error in listener for channel '${Channel}':`,
						ErrorInListener,
					);
				}
			},
		);

		ChannelListeners.set(Listener, TauriUnlistenPromise);
		TauriUnlistenPromise.then((UnlistenFn) => {
			if (ChannelListeners.get(Listener) === TauriUnlistenPromise) {
				ChannelListeners.set(Listener, UnlistenFn);
			} else {
				UnlistenFn();
			}
		}).catch((Error) => {
			console.error(
				`[Sky Host Bridge] Error setting up Tauri listener for '${Channel}':`,
				Error,
			);
			ChannelListeners.delete(Listener);
		});
		return IpcRendererShimInstance;
	},

	once: (
		Channel: string,
		Listener: (Event: IpcRendererEventShim, ...Args: any[]) => void,
	): IpcRendererShim => {
		if (!ValidateIPCChannel(Channel)) return IpcRendererShimInstance;
		let UnlistenFunctionReference: UnlistenFn | null = null;
		const OneTimeListenerWrapper = (TauriEvent: TauriEvent<any[]>) => {
			if (UnlistenFunctionReference) {
				UnlistenFunctionReference();
				TauriListenerMap.get(Channel)?.delete(Listener);
			}
			const EventShim: IpcRendererEventShim = {
				sender: IpcRendererShimInstance,
			};
			try {
				Listener(EventShim, ...(TauriEvent.payload || []));
			} catch (ErrorInListener) {
				console.error(
					`[Sky Host Bridge] Error in one-time listener for '${Channel}':`,
					ErrorInListener,
				);
			}
		};

		const TauriUnlistenPromise = TauriListen(
			Channel,
			OneTimeListenerWrapper,
		);
		const ChannelListeners =
			TauriListenerMap.get(Channel) ||
			new Map<Function, UnlistenFn | Promise<UnlistenFn>>();
		TauriListenerMap.set(Channel, ChannelListeners);
		ChannelListeners.set(Listener, TauriUnlistenPromise);

		TauriUnlistenPromise.then((UnlistenFn) => {
			UnlistenFunctionReference = UnlistenFn;
			if (ChannelListeners.get(Listener) === TauriUnlistenPromise) {
				ChannelListeners.set(Listener, UnlistenFn);
			} else if (
				ChannelListeners.get(Listener) !== UnlistenFunctionReference
			) {
				UnlistenFn();
			}
		}).catch((Error) => {
			console.error(
				`[Sky Host Bridge] Error setting up one-time Tauri listener for '${Channel}':`,
				Error,
			);
			ChannelListeners.delete(Listener);
		});
		return IpcRendererShimInstance;
	},

	removeListener: (
		Channel: string,
		Listener: (Event: IpcRendererEventShim, ...Args: any[]) => void,
	): IpcRendererShim => {
		const AllowNonStandardPrefix = Channel === "message";
		if (!ValidateIPCChannel(Channel, AllowNonStandardPrefix))
			return IpcRendererShimInstance;

		const ChannelListeners = TauriListenerMap.get(Channel);
		if (ChannelListeners) {
			const UnlistenOrPromise = ChannelListeners.get(Listener);
			if (UnlistenOrPromise) {
				if (typeof UnlistenOrPromise === "function") {
					UnlistenOrPromise();
				} else {
					UnlistenOrPromise.then((UnlistenFn) => UnlistenFn()).catch(
						(Error) =>
							console.warn(
								`[Sky Host Bridge] Error during eventual unlisten for '${Channel}':`,
								Error,
							),
					);
				}
				ChannelListeners.delete(Listener);
			}
		}
		return IpcRendererShimInstance;
	},
};

const IpcMessagePortShimInstance: IpcMessagePortShim = {
	acquire: (ResponseChannel: string, Nonce: string): void => {
		console.warn(
			`[Sky Host Bridge] STUB: ipcMessagePort.acquire(responseChannel: '${ResponseChannel}', nonce: '${Nonce}') called. Not supported.`,
		);
	},
};

const WebFrameShimInstance: WebFrameShim = {
	setZoomLevel: (Level: number): void => {
		if (typeof Level === "number" && isFinite(Level)) {
			TauriInvoke("mountain_set_zoom_level", { Level }).catch(
				(Error: any) =>
					console.error(
						"[Sky Host Bridge] Error calling mountain_set_zoom_level:",
						Error,
					),
			);
		} else {
			console.warn(
				`[Sky Host Bridge] webFrame.setZoomLevel: Invalid zoom level: ${Level}`,
			);
		}
	},
	getZoomLevel: (): number => {
		return ResolvedConfigurationCache?.zoomLevel ?? 0;
	},
};

const ProcessShimInstance: ProcessShim = {
	platform: (navigator.platform.toLowerCase().includes("mac")
		? "darwin"
		: navigator.platform.toLowerCase().includes("win")
			? "win32"
			: "linux") as ProcessShim["platform"],
	arch: "x64",
	env: {},
	versions: {
		fiddee: (window as any).FIDDEE_VERSION || "0.0.0-dev",
		webview_runtime:
			navigator.userAgent.match(
				/(Chrome|Firefox|Safari|Edge?)\/([\d.]+)/,
			)?.[0] || "unknown",
	},
	type: "renderer",
	execPath: "/app/FIDDEE_placeholder_executable",
	sandboxed: true,
	contextIsolated: false,
	आटा: false,
	resourcesPath: "/app/placeholder_resources",

	cwd: (): string => {
		const Config = ResolvedConfigurationCache;
		if (Config?.VSCODE_CWD && typeof Config.VSCODE_CWD === "string")
			return Config.VSCODE_CWD;
		if (Config?.homeDir && typeof Config.homeDir === "string") {
			try {
				return URI.parse(Config.homeDir).fsPath;
			} catch (Error) {
				console.warn(
					`[Sky Host Bridge] Error parsing homeDir URI ('${Config.homeDir}') for cwd():`,
					Error,
				);
			}
		}
		console.warn(
			"[Sky Host Bridge] process.cwd(): CWD not available from config. Returning '/' as fallback.",
		);
		return "/";
	},

	shellEnv: async (): Promise<Record<string, string | undefined>> => {
		try {
			return (await TauriInvoke("mountain_fetch_shell_env")) as Record<
				string,
				string | undefined
			>;
		} catch (Error) {
			console.error(
				"[Sky Host Bridge] Error calling mountain_fetch_shell_env:",
				Error,
			);
			return {};
		}
	},

	getProcessMemoryInfo: async (): Promise<{
		privateBytes: number;
		sharedBytes: number;
		residentSet: number;
	}> => {
		try {
			const MemInfo = (await TauriInvoke(
				"mountain_get_process_memory_info",
			)) as {
				private_bytes?: number;
				shared_bytes?: number;
				resident_set_size?: number;
			};
			return {
				privateBytes: MemInfo.private_bytes ?? 0,
				sharedBytes: MemInfo.shared_bytes ?? 0,
				residentSet: MemInfo.resident_set_size ?? 0,
			};
		} catch (Error) {
			console.error(
				"[Sky Host Bridge] Error calling mountain_get_process_memory_info:",
				Error,
			);
			return { privateBytes: 0, sharedBytes: 0, residentSet: 0 };
		}
	},

	on: (Type: string, Callback: (...Args: any[]) => void): void => {
		if (Type === "uncaughtException") {
			const ExistingOnError = window.onerror;
			window.onerror = (
				MessageOrEvent,
				Source,
				Lineno,
				Colno,
				ErrorObject,
			) => {
				Callback(ErrorObject || new Error(MessageOrEvent as string));
				if (ExistingOnError)
					return ExistingOnError.apply(window, [
						MessageOrEvent,
						Source,
						Lineno,
						Colno,
						ErrorObject,
					] as any);
				return false;
			};
			console.debug(
				"[Sky Host Bridge] process.on('uncaughtException') shimmed to window.onerror.",
			);
		} else {
			console.warn(
				`[Sky Host Bridge] STUB: process.on('${Type}') called. Not actively proxied.`,
			);
		}
	},
};

const ContextShimInstance: ContextShim = {
	configuration: (): ISandboxConfiguration | undefined => {
		return ResolvedConfigurationCache;
	},

	resolveConfiguration: (): Promise<ISandboxConfiguration> => {
		if (ResolvedConfigurationCache) {
			return Promise.resolve(ResolvedConfigurationCache);
		}

		if (ResolveConfigurationPromise) {
			return ResolveConfigurationPromise;
		}

		console.log(
			"[Sky Host Bridge] context.resolveConfiguration: Fetching workbench config from Mountain...",
		);

		ResolveConfigurationPromise = TauriInvoke(
			"mountain_get_workbench_configuration",
		)
			.then((ConfigDataFromMountain: unknown) => {
				if (
					ConfigDataFromMountain &&
					typeof ConfigDataFromMountain === "object" &&
					(ConfigDataFromMountain as ISandboxConfiguration).appRoot
				) {
					ResolvedConfigurationCache =
						ConfigDataFromMountain as ISandboxConfiguration;
					console.log(
						"[Sky Host Bridge] Workbench configuration successfully resolved from Mountain.",
					);
				} else {
					console.error(
						"[Sky Host Bridge] Invalid or incomplete configuration from Mountain. Using fallback.",
						ConfigDataFromMountain,
					);
					ResolvedConfigurationCache =
						GetFallbackSandboxConfiguration();
					const FallbackWarningHtml = `<div style="position:fixed; top:0; left:0; background:rgba(255,220,0,0.8); color:black; padding:5px; font-size:12px; z-index:10000;">Warning: Using fallback configuration. Some features may be limited.</div>`;
					if (document.body) {
						const WarningDiv = document.createElement("div");
						WarningDiv.innerHTML = FallbackWarningHtml;
						document.body.prepend(WarningDiv.firstChild!);
					}
				}

				if (ResolvedConfigurationCache.userEnv)
					Object.assign(
						ProcessShimInstance.env,
						ResolvedConfigurationCache.userEnv,
					);
				if (ResolvedConfigurationCache.platform)
					(ProcessShimInstance as any).platform =
						ResolvedConfigurationCache.platform;
				if (ResolvedConfigurationCache.arch)
					(ProcessShimInstance as any).arch =
						ResolvedConfigurationCache.arch;
				else {
					let NavArch: ProcessShim["arch"] = "x64";
					if (
						typeof navigator !== "undefined" &&
						(navigator as any).userAgentData?.architecture
					) {
						const ArchVal = (navigator as any).userAgentData
							.architecture;
						if (ArchVal === "arm" || ArchVal === "aarch64")
							NavArch = "arm64";
					}
					(ProcessShimInstance as any).arch = NavArch;
				}

				if (ResolvedConfigurationCache.versions)
					(ProcessShimInstance as any).versions = {
						...(ProcessShimInstance.versions || {}),
						...ResolvedConfigurationCache.versions,
					};
				if (ResolvedConfigurationCache.execPath)
					(ProcessShimInstance as any).execPath =
						ResolvedConfigurationCache.execPath;

				let FsResourcesPath = "/app/resources_placeholder";
				try {
					if (ResolvedConfigurationCache.resourcesPath) {
						FsResourcesPath =
							ResolvedConfigurationCache.resourcesPath.startsWith(
								"file://",
							)
								? URI.parse(
										ResolvedConfigurationCache.resourcesPath,
									).fsPath
								: ResolvedConfigurationCache.resourcesPath;
					} else if (
						ResolvedConfigurationCache.appRoot?.startsWith(
							"file://",
						)
					) {
						FsResourcesPath = URI.file(
							URI.parse(ResolvedConfigurationCache.appRoot)
								.fsPath,
						).with({
							path:
								URI.parse(ResolvedConfigurationCache.appRoot)
									.fsPath + "/resources",
						}).fsPath;
					} else if (ResolvedConfigurationCache.appRoot) {
						console.warn(
							`[Sky Host Bridge] appRoot ('${ResolvedConfigurationCache.appRoot}') is not a file URI. Setting process.resourcesPath to a placeholder. This may cause issues.`,
						);
						FsResourcesPath = "/app/web_resources_placeholder";
					}
				} catch (UriParseError) {
					console.warn(
						`[Sky Host Bridge] Error parsing paths for process.resourcesPath:`,
						UriParseError,
					);
				}
				(ProcessShimInstance as any).resourcesPath = FsResourcesPath;

				if (typeof ResolvedConfigurationCache.zoomLevel === "number") {
					WebFrameShimInstance.setZoomLevel(
						ResolvedConfigurationCache.zoomLevel,
					);
				}
				return ResolvedConfigurationCache;
			})
			.catch((Error: any) => {
				console.error(
					"[Sky Host Bridge] CRITICAL: Failed to resolve workbench configuration from Mountain. Using fallback and displaying error.",
					Error,
				);
				ResolvedConfigurationCache = GetFallbackSandboxConfiguration();
				if (ResolvedConfigurationCache.userEnv)
					Object.assign(
						ProcessShimInstance.env,
						ResolvedConfigurationCache.userEnv,
					);
				if (ResolvedConfigurationCache.platform)
					(ProcessShimInstance as any).platform =
						ResolvedConfigurationCache.platform;
				if (ResolvedConfigurationCache.arch)
					(ProcessShimInstance as any).arch =
						ResolvedConfigurationCache.arch;
				if (ResolvedConfigurationCache.versions)
					(ProcessShimInstance as any).versions = {
						...(ProcessShimInstance.versions || {}),
						...ResolvedConfigurationCache.versions,
					};
				if (ResolvedConfigurationCache.execPath)
					(ProcessShimInstance as any).execPath =
						ResolvedConfigurationCache.execPath;
				if (ResolvedConfigurationCache.resourcesPath)
					(ProcessShimInstance as any).resourcesPath =
						ResolvedConfigurationCache.resourcesPath;

				const ErrorMessageHtml = `
					<div style="color: #CD3131; background: #252526; padding:20px; font-family:sans-serif; height: 100vh; overflow: auto; box-sizing: border-box; z-index: 10001;">
						<h1>Application Startup Error (FIDDEE Sky Host Bridge)</h1>
						<p>Could not load essential startup configuration from the host application (Mountain). Attempting to continue with fallback values, but functionality will be severely limited.</p>
						<h3>Error Details:</h3>
						<pre style="text-align:left; background:#1E1E1E; color: #D4D4D4; padding:10px; border-radius:4px; white-space:pre-wrap; word-wrap:break-word;">${Error instanceof Error ? `${Error.name}: ${Error.message}\n${Error.stack || "(No stack trace available)"}` : String(Error)}</pre>
					</div>`;
				if (document.body) {
					const ErrorDiv = document.createElement("div");
					ErrorDiv.innerHTML = ErrorMessageHtml;
					document.body.prepend(ErrorDiv.firstChild!);
				} else {
					document.write(ErrorMessageHtml);
				}
				return ResolvedConfigurationCache;
			});

		return ResolveConfigurationPromise;
	},
};

const WebUtilsShimInstance: WebUtilsShim = {
	getPathForFile: (File: File): string => {
		const FilePath = (File as any).path || File.name;
		return FilePath;
	},
};

const SkyHostApiGlobal = {
	ipcRenderer: IpcRendererShimInstance,
	ipcMessagePort: IpcMessagePortShimInstance,
	webFrame: WebFrameShimInstance,
	process: ProcessShimInstance,
	context: ContextShimInstance,
	webUtils: WebUtilsShimInstance,
};

if ((window as any).vscode) {
	console.warn(
		"[Sky Host Bridge] `window.vscode` already exists. Overwriting.",
	);
}

(window as any).vscode = SkyHostApiGlobal;

console.log(
	"[Sky Host Bridge] `window.vscode` shim attached. Workbench can now load.",
);

ContextShimInstance.resolveConfiguration().catch((_Error) => {
	// Error handling is managed within resolveConfiguration.
});
