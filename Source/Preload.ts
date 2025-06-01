// --- Tauri API Imports ---
import {
	getName as getTauriAppNameFromApi,
	getVersion as getTauriAppVersionFromApi,
} from "@tauri-apps/api/app";
import {
	emit as tauriEmit,
	listen as tauriListen,
	once as tauriOnce,
	type Event as TauriEvent,
} from "@tauri-apps/api/event";
import {
	arch as tauriOsArch,
	platform as tauriOsPlatform,
	type as tauriOsType,
	version as tauriOsVersion,
} from "@tauri-apps/api/os";
import {
	appDataDir,
	appDir,
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
import { invoke } from "@tauri-apps/api/a";
import { Window } from "@tauri-apps/api/window";
// --- VSCode Type Imports (for type checking and clarity) ---
// These paths need to be resolvable in your development environment for type checking.
// They are type-only imports and won't be bundled if `isolatedModules` is true and they are used correctly.
import { URI } from "vs/base/common/uri";
import type { ISandboxConfiguration } from "vs/base/parts/sandbox/common/sandboxTypes";
import type {
	IpcRenderer,
	WebFrame,
	WebUtils,
} from "vs/base/parts/sandbox/electron-sandbox/electronTypes";
import type {
	IMainWindowSandboxGlobals,
	// Shimmed interface type
	IpcMessagePort,
	// This will be our shimmed interface type
	ISandboxNodeProcess,
} from "vs/base/parts/sandbox/electron-sandbox/globals";
// For product.nameShort
import product from "vs/platform/product/common/product.js";
import type { INativeWindowConfiguration } from "vs/platform/window/common/window";
// Ensure this is importable
import { reviveIdentifier } from "vs/platform/workspace/common/workspace.js";

// src/tauri-preload.ts
// This script shims `window.vscode` for a Tauri environment,

// using a logging and define methodology similar to Policy.ts.

// --- Build-Time Define Declarations (esbuild or other bundler must replace these) ---
// Should be true in development, false in production
declare const __DEV__: boolean;

// Example: a version string for VSCode part
declare const __VSCODE_VERSION__: string;

// Example: from tauri app itself
declare const __TAURI_APP_VERSION__: string;

// e.g., "development" or "production"
declare const __NODE_ENV__: string;

declare const __TAURI_ENV_DEBUG__: string;

// --- Global Type Augmentation (should be in a central .d.ts file, repeated here for context) ---
// This ensures TypeScript knows about window.vscode.
// Ideally, this is in a shared `globals.d.ts` included in your tsconfig.
declare global {
	interface Window {
		// Use the actual VSCode interface for the shim target
		vscode: IMainWindowSandboxGlobals;

		// Add other VSCode specific globals if your workbench.ts sets/expects them
		_VSCODE_FILE_ROOT?: string;

		_WORKER?: string;

		_VSCODE_NLS_MESSAGES?: any;

		_VSCODE_NLS_LANGUAGE?: string;

		_VSCODE_CSS_LOAD?: (url: string) => void;
	}
}

// --- Logging Utilities (Policy.ts style) ---
const LOG_PREFIX = "[TauriPreload]";

const Log = __DEV__
	? (...messages: any[]) => {
			console.log(LOG_PREFIX, ...messages);
		}
	: () => {};

const ErrorLog = __DEV__
	? (...messages: any[]) => {
			console.error(LOG_PREFIX, ...messages);
		}
	: () => {};

const WarnLog = __DEV__
	? (...messages: any[]) => {
			console.warn(LOG_PREFIX, ...messages);
		}
	: () => {};

Log("Script executing. DEV mode:", __DEV__);

// --- Main Shim Logic ---
(async () => {
	try {
		// --- Gather Tauri API Data Asynchronously ---
		const currentProcessInfo: ProcessInfo = await getCurrentProcess();

		const platform: string = await tauriOsPlatform();

		const arch: string = await tauriOsArch();

		const osTypeStr: string = await tauriOsType();

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

		// --- Helper to parse configuration from meta tag ---
		const getWorkbenchConstructionOptions =
			(): Partial<INativeWindowConfiguration> => {
				const metaElement = document.getElementById(
					"vscode-workbench-web-configuration",
				);

				const settings = metaElement?.dataset["settings"];

				try {
					return settings ? JSON.parse(settings) : {};
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

		// --- Define Shimmed Globals ---
		const sandboxNodeProcessShim: ISandboxNodeProcess = {
			platform: platform,

			arch: arch,

			type: "renderer",

			versions: {
				node: currentProcessInfo.versions?.node || "N/A (Tauri)",

				chrome:
					navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] ||
					"unknown",

				// Clearly not Electron
				electron: "0.0.0-tauri",

				// App name and version from Tauri API
				[appNameFromApi]: appVersionFromApi,

				tauri:
					typeof __TAURI_APP_VERSION__ !== "undefined"
						? __TAURI_APP_VERSION__
						: // Prefer build-time define if available
							appVersionFromApi,
			},

			env: {
				// Tauri might expose some limited env vars
				...currentProcessInfo.env,

				VSCODE_DEV:
					nodeEnvFromDefine === "development" ||
					tauriEnvDebugFromDefine === "true"
						? "1"
						: undefined,

				// CWD of the main Tauri process
				VSCODE_CWD: await tauriResolve("."),

				VSCODE_NLS_CONFIG: JSON.stringify({
					// VSCode needs this for NLS init
					locale:
						initialConfigFromMeta.locale ||
						navigator.language ||
						"en",

					// Can be populated if you have NLS data
					availableLanguages: {},

					pseudo: false,
				}),
			},

			execPath:
				currentProcessInfo.execPath ||
				(await tauriJoin(tauriAppExeDir, appNameFromApi)),

			on: (eventType: string, callback: Function) => {
				WarnLog(
					`process.on('${eventType}') called. Not fully implemented in Tauri shim.`,
				);
			},

			// Use the resolved CWD
			cwd: () => sandboxNodeProcessShim.env.VSCODE_CWD || ".",

			getProcessMemoryInfo: async () => {
				WarnLog(
					"getProcessMemoryInfo not available in Tauri. Returning mock data.",
				);

				return { private: 0, residentSet: 0, shared: 0 };
			},

			shellEnv: async () => {
				Log("shellEnv requested. Returning current env (Tauri shim).");

				// For a more complete shell env, would need Rust-side `invoke`
				return { ...sandboxNodeProcessShim.env };
			},
		};

		const ipcRendererShimImpl: IpcRenderer = {
			// Use VSCode's IpcRenderer type
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

					// Add more specific channel handlers if VSCode relies on them
					// Example: if INativeHostService methods were invoked over IPC
					// if (channel === 'vscode:showOpenDialog') {

					//   return invoke('plugin:dialog|open', args[0]);

					// }

					WarnLog(
						`Unhandled ipcRenderer.invoke on channel: ${channel}. Returning undefined.`,
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
						// Adapt TauriEvent to something like IpcRendererEvent if needed by listener
						listener(
							{
								sender: ipcRendererShim /* mock sender */,
							} as any,

							event.payload,
						);
					}).catch(console.error);
				}

				return ipcRendererShim;
			},

			once: (
				channel: string,

				listener: (event: any, ...args: any[]) => void,
			): IpcRenderer => {
				if (channel.startsWith("vscode:")) {
					tauriOnce(channel, (event: TauriEvent<any>) => {
						listener(
							{ sender: ipcRendererShim } as any,

							event.payload,
						);
					}).catch(console.error);
				}

				return ipcRendererShim;
			},

			removeListener: (
				channel: string,

				listener: (...args: any[]) => void,
			): IpcRenderer => {
				console.warn(
					`[tauri-preload] ipcRenderer.removeListener for channel '${channel}' is not implemented in this shim.`,
				);

				// Tauri's listen() returns an UnlistenFn, which you'd need to store and call.
				return ipcRendererShim;
			},
		};

		const webFrameShimImpl: WebFrame = {
			// Use VSCode's WebFrame type
			setZoomLevel: async (level: number) => {
				try {
					const newFactor = Math.pow(1.2, level);

					// await Window.getCurrent().scale;

					Log(
						`webFrame.setZoomLevel(${level}) -> appWindow.setScaleFactor(${newFactor})`,
					);
				} catch (e) {
					ErrorLog(`Error setting zoom level:`, e);
				}
			},
		};

		const sandboxContextImpl = (() => {
			const Label = Window.getCurrent().label;

			// IIFE to manage closure for _configuration
			let _resolvedConfiguration: ISandboxConfiguration | undefined =
				undefined;

			const configPromise = (async (): Promise<ISandboxConfiguration> => {
				if (_resolvedConfiguration) return _resolvedConfiguration;

				Log("context.resolveConfiguration called");

				const tauriHome = await homeDir();

				const tauriAppData = await appDataDir();

				const tauriLogs = await appLogDir();

				const currentWindowLabel =
					Label ?? `main-${Math.random().toString(16).slice(2)}`;

				// Basic structure for INativeWindowConfiguration
				const nativeConfig: INativeWindowConfiguration = {
					// Spread options from <meta> tag
					...initialConfigFromMeta,

					// Mandatory or critical fields
					// Use Tauri window label or generate one
					// windowId: currentWindowLabel,

					windowId: 0,

					machineId: (await invoke("get_machine_id").catch(
						() => "tauri-machine-id-placeholder",
					)) as string,

					sqmId: (await invoke("get_sqm_id").catch(
						() => "tauri-sqm-id-placeholder",
					)) as string,

					sessionId: `tauri-session-${Date.now()}-${Math.random().toString(16).slice(2)}`,

					// VSCode expects this to be where its 'out' is
					appRoot: await tauriResolve(tauriResDir, "."),

					logsPath: tauriLogs,

					// Use the env we constructed
					userEnv: sandboxNodeProcessShim.env,

					os: {
						arch: arch,

						hostname: "tauri.localhost",

						release: osRelease,
					},

					colorScheme: {
						dark: window.matchMedia("(prefers-color-scheme: dark)")
							.matches,

						highContrast:
							document.body.classList.contains("hc-dark") ||
							document.body.classList.contains("hc-light"),
					},

					homeDir: tauriHome,

					tmpDir:
						osTypeStr === "Windows_NT"
							? ((await invoke("get_env", { name: "TEMP" }).catch(
									() => "C:\\Temp",
								)) as string)
							: "/tmp",

					userDataDir: tauriAppData,

					// Workspace related - ensure URIs are revived if they come as strings/UriComponents from meta
					workspace: initialConfigFromMeta.workspace
						? reviveIdentifier(
								initialConfigFromMeta.workspace as any,
							)
						: undefined,

					// folderUri: initialConfigFromMeta["folder-uri"]
					// 	? URI.revive(initialConfigFromMeta["folder-uri"])
					// 	: undefined,

					folderUri: "",

					// workspaceUri: initialConfigFromMeta.workspace
					// 	? URI.revive(initialConfigFromMeta.workspace)
					// 	: undefined,

					workspaceUri: "",

					// Profiles - ensure paths are URIs
					profiles: initialConfigFromMeta.profiles || {
						home: URI.file(
							await tauriJoin(tauriAppData, "User", "profiles"),
						),

						all: [],

						profile: {
							id: "defaultProfile",

							name: "Default",

							isDefault: true,

							useDefaultFlags: {},

							location: URI.file(
								await tauriJoin(
									tauriAppData,

									"User",

									"profiles",

									"defaultProfile",
								),
							),
						},
					},

					defaultProfile: initialConfigFromMeta.defaultProfile || {
						isDefault: true,

						name: "Default",

						id: "defaultProfile",

						useDefaultFlags: {},

						location: URI.file(
							await tauriJoin(
								tauriAppData,

								"User",

								"profiles",

								"defaultProfile",
							),
						),

						settings: null,

						extensions: null,

						keybindings: null,

						uiState: null,
					},

					loggers:
						initialConfigFromMeta.loggers?.map((l) => ({
							...l,

							resource: URI.revive(l.resource),
						})) || [],

					// Booleans usually default well if not in meta
					autoDetectHighContrast:
						initialConfigFromMeta.autoDetectHighContrast ?? true,

					autoDetectColorScheme:
						initialConfigFromMeta.autoDetectColorScheme ?? true,

					zoomLevel: initialConfigFromMeta.zoomLevel ?? 0,

					isCustomZoomLevel:
						initialConfigFromMeta.isCustomZoomLevel ?? false,

					// Other fields might be needed from INativeWindowConfiguration
					// Example: productConfiguration can be merged from initialConfigFromMeta and product.js
					productConfiguration: {
						...product,

						...initialConfigFromMeta.productConfiguration,
					},

					// ... many more fields from INativeWindowConfiguration may need default values or Tauri equivalents
				};

				// Cast, as INative is wider
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
			// Use VSCode's WebUtils type
			getPathForFile: (file: File): string => {
				WarnLog(
					`webUtils.getPathForFile(${file.name}) - basic shim. Returning name.`,
				);

				// Electron File has .path, web File often not reliably
				return (file as any).path || file.name;
			},
		};

		const ipcMessagePortShimImpl: IpcMessagePort = {
			// Use VSCode's IpcMessagePort type
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

		// Expose the shimmed globals on the window object
		// This assignment requires `window` to be augmented to accept `vscode` property
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

		document.body.prepend(errDiv);
	}
})();

// Export something to make it a module, if this script is processed by a module system.
// If it's a raw preload script injected by Tauri, this might not be necessary.
export {};
