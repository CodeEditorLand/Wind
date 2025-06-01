// Preload.ts

// --- Tauri API Imports ---
import {
	getName as getTauriAppNameFromApi,
	getVersion as getTauriAppVersionFromApi,
} from "@tauri-apps/api/app";
// Assuming this resolves

import { invoke } from "@tauri-apps/api/core";
import {
	emit as tauriEmit,
	listen as tauriListen,
	once as tauriOnce,
	type Event as TauriEvent,
} from "@tauri-apps/api/event";
// NOTE: For TS2307, ensure @tauri-apps/api is correctly installed and its types are discoverable.
import {
	arch as tauriOsArch,
	platform as tauriOsPlatform,
	type as tauriOsType,
	version as tauriOsVersion,
} from "@tauri-apps/api/os";
// Assuming this resolves in your environment
import {
	appDataDir,
	appLogDir,
	executableDir,
	homeDir,
	resourceDir,
	join as tauriJoin,
	resolve as tauriResolve,
} from "@tauri-apps/api/path";
import {
	getCurrent as getCurrentProcess,
	type ProcessInfo,
} from "@tauri-apps/api/process";
import { Window } from "@tauri-apps/api/window";
// --- VSCode Type Imports (for type checking and clarity) ---
import { URI } from "vs/base/common/uri";
import type { ISandboxConfiguration } from "vs/base/parts/sandbox/common/sandboxTypes";
import type {
	IpcRenderer,
	ProcessMemoryInfo,
	WebFrame,
	WebUtils,
} from "vs/base/parts/sandbox/electron-sandbox/electronTypes";
import type {
	IMainWindowSandboxGlobals,
	IpcMessagePort,
	ISandboxNodeProcess,
	// This might be the unexported type. Let's define a local version if needed.
	// IProcessEnvironment,
} from "vs/base/parts/sandbox/electron-sandbox/globals";
import product from "vs/platform/product/common/product.js";
// NOTE: For TS2305, ILoggerResource might not be exported from this path.
// If it's not, you might need to find its actual export location or define a local version.
// Same for UriDto if TS2459 persists.
import type {
	IUserDataProfile /* ILoggerResource, UriDto, */,
	UseDefaultProfileFlags,
} from "vs/platform/userDataProfile/common/userDataProfile";
import type {
	IColorScheme,
	INativeWindowConfiguration,
	// For nativeConfig.os
	IOSConfiguration,
	// For INativeWindowConfiguration
	IPartsSplash,
	// For partsSplash
	IWindowConfiguration,
} from "vs/platform/window/common/window";
import {
	reviveIdentifier,
	type IAnyWorkspaceIdentifier,
	type ISingleFolderWorkspaceIdentifier,
	type IWorkspaceIdentifier,
} from "vs/platform/workspace/common/workspace.js";

// Local type declaration for IProcessEnvironment if VSCode doesn't export it
// This is a common structure for process environments.
interface ILocalProcessEnvironment {
	[key: string]: string | undefined;
}

// Local type declaration for UriDto if VSCode doesn't export it.
// This is a common pattern for serializing URIs.
interface ILocalUriDto<T> {
	// Marker for URI DTO
	$mid: 11;

	scheme: string;

	authority?: string;

	path?: string;

	query?: string;

	fragment?: string;

	external?: string;

	_formatted?: string | null;

	_fsPath?: string | null;

	// If it wraps another type T
	payload?: T;
}

// Local type for ILoggerResource if not exported
interface ILocalLoggerResource {
	// or ILocalUriDto<any> if URI itself isn't directly usable
	resource: URI;

	// Assuming LogLevel is a number type in VSCode
	logLevel?: number;

	// Add other properties if they exist
	id: string;

	// Usually a name for the logger
	name: string;

	hidden?: boolean;

	// Context key expression
	when?: string;

	// if there's a logger group concept
	// group?: string;

	// extensionId?: string;
}

declare const __DEV__: boolean;

declare const __VSCODE_VERSION__: string;

declare const __TAURI_APP_VERSION__: string;

declare const __NODE_ENV__: string;

declare const __TAURI_ENV_DEBUG__: string;

declare global {
	interface Window {
		vscode: IMainWindowSandboxGlobals;

		_VSCODE_FILE_ROOT?: string;

		_WORKER?: string;

		_VSCODE_NLS_MESSAGES?: any;

		_VSCODE_NLS_LANGUAGE?: string;

		_VSCODE_CSS_LOAD?: (url: string) => void;
	}
}

const LOG_PREFIX = "[TauriPreload]";

const Log = __DEV__
	? (...messages: any[]) => console.log(LOG_PREFIX, ...messages)
	: () => {};

const ErrorLog = __DEV__
	? (...messages: any[]) => console.error(LOG_PREFIX, ...messages)
	: () => {};

const WarnLog = __DEV__
	? (...messages: any[]) => console.warn(LOG_PREFIX, ...messages)
	: () => {};

Log("Script executing. DEV mode:", __DEV__);

interface TauriProcessEnv extends ILocalProcessEnvironment {
	// Use local definition
	VSCODE_CWD: string;

	VSCODE_NLS_CONFIG: string;

	VSCODE_DEV?: "1";
}

function reviveProfileUrisRecursively(data: any): any {
	if (!data || typeof data !== "object") {
		return data;
	}

	if (Array.isArray(data)) {
		return data.map((item) => reviveProfileUrisRecursively(item));
	}

	const GUEST_SCHEME_AUTHORITY_REGEXP =
		/^([a-zA-Z][a-zA-Z0-9+.-]*):(\/\/([^\\/?#]*))?/;

	// Check if it resembles UriComponents before trying to revive
	if (
		typeof data.scheme === "string" &&
		(GUEST_SCHEME_AUTHORITY_REGEXP.test(data.scheme) ||
			typeof data.path === "string" ||
			typeof data.authority === "string" ||
			data.$mid === 1) /* typical marker for URI.toJSON() */
	) {
		return URI.revive(data);
	}

	const result: any = {};

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			const value = data[key];

			if (
				key === "location" ||
				key === "home" ||
				key === "resource" ||
				key.endsWith("Uri") ||
				key.endsWith("Resource") ||
				key.endsWith("Home")
			) {
				if (
					value &&
					typeof value === "object" &&
					typeof value.scheme === "string"
				) {
					result[key] = URI.revive(value);
				} else if (
					typeof value === "string" &&
					URI.isUri(URI.parse(value))
				) {
					result[key] = URI.parse(value);
				} else {
					result[key] = reviveProfileUrisRecursively(value);
				}
			} else {
				result[key] = reviveProfileUrisRecursively(value);
			}
		}
	}

	return result;
}

(async () => {
	try {
		const currentProcessInfo: ProcessInfo = await getCurrentProcess();

		const platform: string = await tauriOsPlatform();

		const arch: string = await tauriOsArch();

		const osType: string = await tauriOsType();

		const osRelease: string = await tauriOsVersion();

		const appNameFromApi: string = await getTauriAppNameFromApi();

		const appVersionFromApi: string = await getTauriAppVersionFromApi();

		const tauriAppExeDir: string = await executableDir();

		const tauriResDir: string = await resourceDir();

		const nodeEnvFromDefine: string =
			typeof __NODE_ENV__ !== "undefined" ? __NODE_ENV__ : "production";

		const tauriEnvDebugFromDefine: string =
			typeof __TAURI_ENV_DEBUG__ !== "undefined"
				? __TAURI_ENV_DEBUG__
				: "false";

		Log("Fetched initial Tauri API data.");

		const getWorkbenchConstructionOptions =
			(): Partial<INativeWindowConfiguration> => {
				const metaElement = document.getElementById(
					"vscode-workbench-web-configuration",
				);

				// Use optional chaining for dataset
				const settings = metaElement?.dataset?.["settings"];

				try {
					const parsed = settings ? JSON.parse(settings) : {};

					return reviveProfileUrisRecursively(parsed);
				} catch (e) {
					ErrorLog(
						"Failed to parse workbench construction options from meta tag:",

						e,
					);

					return {};
				}
			};

		const initialConfigFromMeta = getWorkbenchConstructionOptions();

		Log("Parsed initial config from meta tag:", initialConfigFromMeta);

		const vscodeCwd = await tauriResolve(".");

		const sandboxNodeProcessShim: ISandboxNodeProcess = {
			platform: platform,

			arch: arch,

			type: "renderer",

			versions: {
				node: currentProcessInfo.versions?.node || "N/A (Tauri)",

				chrome:
					navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] ||
					"unknown",

				electron: "0.0.0-tauri",

				[appNameFromApi]: appVersionFromApi,

				tauri:
					typeof __TAURI_APP_VERSION__ !== "undefined"
						? __TAURI_APP_VERSION__
						: appVersionFromApi,
			},

			// Correctly assign to TauriProcessEnv which satisfies ILocalProcessEnvironment
			env: {
				// Cast if currentProcessInfo.env is too generic
				...(currentProcessInfo.env as ILocalProcessEnvironment),

				VSCODE_DEV:
					nodeEnvFromDefine === "development" ||
					tauriEnvDebugFromDefine === "true"
						? "1"
						: undefined,

				VSCODE_CWD: vscodeCwd,

				VSCODE_NLS_CONFIG: JSON.stringify({
					locale:
						initialConfigFromMeta.locale ||
						navigator.language ||
						"en",

					availableLanguages: {},

					pseudo: false,
				}),

				// Ensure this cast is valid by making TauriProcessEnv compatible
			} as TauriProcessEnv,

			execPath:
				currentProcessInfo.execPath ||
				(await tauriJoin(tauriAppExeDir, appNameFromApi)),

			on: (eventType: string, _callback: Function) => {
				WarnLog(
					`process.on('${eventType}') called. Not fully implemented in Tauri shim.`,
				);
			},

			// Use bracket notation and non-null assertion
			cwd: () => sandboxNodeProcessShim.env["VSCODE_CWD"]!,

			getProcessMemoryInfo: async (): Promise<ProcessMemoryInfo> => {
				WarnLog(
					"getProcessMemoryInfo not available in Tauri. Returning mock data.",
				);

				return { private: 0, residentSet: 0, shared: 0 };
			},

			shellEnv: async (): Promise<ILocalProcessEnvironment> => {
				Log("shellEnv requested. Returning current env (Tauri shim).");

				return {
					...sandboxNodeProcessShim.env,
				} as ILocalProcessEnvironment;
			},
		};

		const ipcRendererShimImpl: IpcRenderer = {
			send: (channel: string, ...args: any[]): void => {
				if (channel.startsWith("vscode:")) {
					tauriEmit(
						channel,

						args.length === 1 ? args[0] : args,
					).catch((e) =>
						ErrorLog(`Error emitting IPC '${channel}':`, e),
					);
				} else {
					WarnLog(
						`Denying IPC send on non-vscode channel: ${channel}`,
					);
				}
			},

			invoke: async (channel: string, ...args: any[]): Promise<any> => {
				if (channel.startsWith("vscode:")) {
					if (channel === "vscode:fetchShellEnv") {
						return {
							...sandboxNodeProcessShim.env,

							FROM_TAURI_SHELL_ENV_SHIM: "true",
						};
					}

					WarnLog(
						`Unhandled ipcRenderer.invoke on channel: ${channel}. Args:`,

						args,

						`. Returning undefined.`,
					);

					return undefined;
				}

				WarnLog(`Denying IPC invoke on non-vscode channel: ${channel}`);

				throw new Error(
					`Unsupported IPC invoke channel in Tauri: ${channel}`,
				);
			},

			on: (
				channel: string,

				listener: (event: any, ...args: any[]) => void,
			): IpcRenderer => {
				if (channel.startsWith("vscode:")) {
					tauriListen(channel, (event: TauriEvent<any>) => {
						listener(
							{ sender: ipcRendererShimImpl } as any,

							event.payload,
						);
					}).catch(console.error);
				}

				return ipcRendererShimImpl;
			},

			once: (
				channel: string,

				listener: (event: any, ...args: any[]) => void,
			): IpcRenderer => {
				if (channel.startsWith("vscode:")) {
					tauriOnce(channel, (event: TauriEvent<any>) => {
						listener(
							{ sender: ipcRendererShimImpl } as any,

							event.payload,
						);
					}).catch(console.error);
				}

				return ipcRendererShimImpl;
			},

			removeListener: (
				channel: string,

				_listener: (...args: any[]) => void,
			): IpcRenderer => {
				console.warn(
					`[tauri-preload] ipcRenderer.removeListener for channel '${channel}' is not implemented in this shim.`,
				);

				return ipcRendererShimImpl;
			},
		};

		const webFrameShimImpl: WebFrame = {
			setZoomLevel: async (level: number) => {
				try {
					const factor = Math.pow(1.2, level);

					Log(
						`webFrame.setZoomLevel(${level}) - factor ${factor}. Tauri might need CSS zoom or specific webview API.`,
					);
				} catch (e) {
					ErrorLog(`Error setting zoom level:`, e);
				}
			},
		};

		const sandboxContextImpl = (() => {
			let _resolvedConfiguration: ISandboxConfiguration | undefined =
				undefined;

			const configPromise = (async (): Promise<ISandboxConfiguration> => {
				if (_resolvedConfiguration) return _resolvedConfiguration;

				Log("context.resolveConfiguration called");

				const tauriHome = await homeDir();

				const tauriAppData = await appDataDir();

				const tauriLogs = await appLogDir();

				const defaultProfileLocation = URI.file(
					await tauriJoin(
						tauriAppData,

						"User",

						"profiles",

						"defaultProfile",
					),
				);

				const defaultGlobalStorageHome = URI.file(
					await tauriJoin(
						defaultProfileLocation.fsPath,

						"globalStorage",
					),
				);

				const commonProfileProps = {
					globalStorageHome: defaultGlobalStorageHome,

					settingsResource: URI.file(
						await tauriJoin(
							defaultProfileLocation.fsPath,

							"settings.json",
						),
					),

					keybindingsResource: URI.file(
						await tauriJoin(
							defaultProfileLocation.fsPath,

							"keybindings.json",
						),
					),

					tasksResource: URI.file(
						await tauriJoin(
							defaultProfileLocation.fsPath,

							"tasks.json",
						),
					),

					snippetsHome: URI.file(
						await tauriJoin(
							defaultProfileLocation.fsPath,

							"snippets",
						),
					),

					extensionsResource: URI.file(
						await tauriJoin(
							defaultProfileLocation.fsPath,

							"extensions.json",
						),
					),
				};

				const defaultProfilesValue: {
					home: URI;

					all: readonly ILocalUriDto<IUserDataProfile>[];

					profile: IUserDataProfile;
				} = {
					home: URI.file(
						await tauriJoin(tauriAppData, "User", "profiles"),
					),

					all: [],

					profile: {
						id: "defaultProfile",

						name: "Default",

						isDefault: true,

						useDefaultFlags: {} as UseDefaultProfileFlags,

						location: defaultProfileLocation,

						...commonProfileProps,

						// Corrected from transient to isTransient
						isTransient: false,
					},
				};

				const defaultProfileValue: IUserDataProfile = {
					isDefault: true,

					name: "Default",

					id: "defaultProfile",

					useDefaultFlags: {} as UseDefaultProfileFlags,

					location: defaultProfileLocation,

					...commonProfileProps,

					// Corrected from transient to isTransient
					isTransient: false,
				};

				// Ensure URIs in initialConfigFromMeta.loggers are revived if they are plain objects
				const revivedLoggers: ILocalLoggerResource[] = (
					initialConfigFromMeta.loggers || []
				).map(
					(l) =>
						({
							...l,

							resource:
								l.resource instanceof URI
									? l.resource
									: URI.revive(l.resource),
						}) as ILocalLoggerResource,
				);

				const nativeConfig: INativeWindowConfiguration = {
					...initialConfigFromMeta,

					windowId:
						initialConfigFromMeta.windowId ??
						Window.getCurrent().label ??
						// Provide default if label is also undefined
						0,

					machineId: (await invoke("get_machine_id").catch(
						() => "tauri-machine-id-placeholder",
					)) as string,

					sqmId: (await invoke("get_sqm_id").catch(
						() => "tauri-sqm-id-placeholder",
					)) as string,

					sessionId: `tauri-session-${Date.now()}-${Math.random().toString(16).slice(2)}`,

					appRoot:
						initialConfigFromMeta.appRoot ||
						(await tauriResolve(tauriResDir, ".")),

					logsPath: initialConfigFromMeta.logsPath || tauriLogs,

					userEnv: {
						...(sandboxNodeProcessShim.env as ILocalProcessEnvironment),

						...(initialConfigFromMeta.userEnv as ILocalProcessEnvironment),
					} as ILocalProcessEnvironment,

					os: {
						arch: arch,

						hostname: "tauri.localhost",

						release: osRelease,

						// Added for IOSConfiguration
						platform: platform,

						// Add other optional IOSConfiguration properties if needed and available
						// if IOSConfiguration expects 'type'
						// e.g. type: osType,

						// Cast to IOSConfiguration
					} as IOSConfiguration,

					colorScheme:
						initialConfigFromMeta.colorScheme ||
						({
							dark: window.matchMedia(
								"(prefers-color-scheme: dark)",
							).matches,

							highContrast:
								document.body.classList.contains("hc-dark") ||
								document.body.classList.contains("hc-light"),
						} as IColorScheme),

					homeDir: initialConfigFromMeta.homeDir
						? typeof initialConfigFromMeta.homeDir === "string"
							? initialConfigFromMeta.homeDir
							: (initialConfigFromMeta.homeDir as URI).fsPath
						: tauriHome,

					tmpDir: initialConfigFromMeta.tmpDir
						? typeof initialConfigFromMeta.tmpDir === "string"
							? initialConfigFromMeta.tmpDir
							: (initialConfigFromMeta.tmpDir as URI).fsPath
						: osType === "Windows_NT"
							? ((await invoke("get_env", { name: "TEMP" }).catch(
									() => "C:\\Temp",
								)) as string)
							: "/tmp",

					userDataDir: initialConfigFromMeta.userDataDir
						? typeof initialConfigFromMeta.userDataDir === "string"
							? initialConfigFromMeta.userDataDir
							: (initialConfigFromMeta.userDataDir as URI).fsPath
						: tauriAppData,

					workspace: initialConfigFromMeta.workspace
						? reviveIdentifier(initialConfigFromMeta.workspace)
						: (undefined as
								| IWorkspaceIdentifier
								| ISingleFolderWorkspaceIdentifier
								// More specific type
								| undefined),

					folderUri:
						initialConfigFromMeta["folder-uri"] instanceof URI
							? initialConfigFromMeta["folder-uri"]
							: // Use 'folder-uri' from meta
								undefined,

					workspaceUri:
						initialConfigFromMeta.workspace instanceof URI
							? initialConfigFromMeta.workspace
							: // Use 'workspace' which might be a URI
								undefined,

					profiles:
						initialConfigFromMeta.profiles || defaultProfilesValue,

					defaultProfile:
						initialConfigFromMeta.defaultProfile ||
						defaultProfileValue,

					// Use revived loggers
					loggers: revivedLoggers,

					autoDetectHighContrast:
						initialConfigFromMeta.autoDetectHighContrast ?? true,

					autoDetectColorScheme:
						initialConfigFromMeta.autoDetectColorScheme ?? true,

					// TS2322: Ensure this is number
					zoomLevel: initialConfigFromMeta.zoomLevel ?? 0,

					isCustomZoomLevel:
						initialConfigFromMeta.isCustomZoomLevel ?? false,

					productConfiguration: {
						...product,

						...(initialConfigFromMeta.productConfiguration || {}),

						// Ensure productConfiguration from meta is not undefined
					},

					accessibilitySupport:
						initialConfigFromMeta.accessibilitySupport === "on" ||
						initialConfigFromMeta.accessibilitySupport === "off"
							? initialConfigFromMeta.accessibilitySupport
							: // Make it assignable
								"unknown",

					perfMarks: initialConfigFromMeta.perfMarks || [],

					policiesData: initialConfigFromMeta.policiesData || {},

					partsSplash:
						initialConfigFromMeta.partsSplash ||
						// Cast to IPartsSplash
						({} as IPartsSplash),
				};

				_resolvedConfiguration = nativeConfig as ISandboxConfiguration;

				Log("Configuration resolved:", _resolvedConfiguration);

				return _resolvedConfiguration;
			})();

			return {
				configuration: () => _resolvedConfiguration,

				resolveConfiguration: () => configPromise,
			};
		})();

		const webUtilsShimImpl: WebUtils = {
			getPathForFile: (file: File): string => {
				WarnLog(
					`webUtils.getPathForFile(${file.name}) - basic shim. Returning name.`,
				);

				return (file as any).path || file.name;
			},
		};

		const ipcMessagePortShimImpl: IpcMessagePort = {
			acquire: (responseChannel: string, nonce: string) => {
				WarnLog(
					`ipcMessagePort.acquire called for ${responseChannel}, nonce ${nonce}. Not implemented.`,
				);
			},
		};

		const globals: IMainWindowSandboxGlobals = {
			process: sandboxNodeProcessShim,

			ipcRenderer: ipcRendererShimImpl,

			webFrame: webFrameShimImpl,

			context: sandboxContextImpl,

			webUtils: webUtilsShimImpl,

			ipcMessagePort: ipcMessagePortShimImpl,
		};

		window.vscode = globals;

		Log("window.vscode shimmed for Tauri.");
	} catch (error) {
		ErrorLog("Error during preload script execution:", error);

		const errDiv = document.createElement("div");

		errDiv.textContent = `Tauri Preload Error: ${error instanceof Error ? error.message : String(error)}. Application may not start correctly. Check console.`;

		errDiv.style.color = "red";

		errDiv.style.padding = "20px";

		errDiv.style.fontFamily = "sans-serif";

		errDiv.style.whiteSpace = "pre-wrap";

		if (document.body) {
			// Ensure body exists before prepending
			document.body.prepend(errDiv);
		} else {
			// Fallback if body is not ready, though unusual for preload scripts
			window.addEventListener("DOMContentLoaded", () =>
				document.body.prepend(errDiv),
			);
		}
	}
})();

export {};
