// Preload.ts

// --- Tauri API Imports ---
import {
	getName as getTauriAppNameFromApi,
	getVersion as getTauriAppVersionFromApi,
} from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import {
	emit as tauriEmit,
	listen as tauriListen,
	once as tauriOnce,
	type Event as TauriEvent,
} from "@tauri-apps/api/event";
// NOTE: For TS2307, ensure @tauri-apps/api is correctly installed and its types are discoverable by TypeScript.
// This might involve checking tsconfig.json, pnpm/npm/yarn installation, and IDE caches.
import {
	// This is a function: async () => Promise<Arch>
	arch as tauriOsArch,
	// This is a function: async () => Promise<Platform>
	platform as tauriOsPlatform,
	// This is a function: async () => Promise<OsType>
	type as tauriOsType,
	// This is a function: async () => Promise<string>
	version as tauriOsVersion,
} from "@tauri-apps/api/os";
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
	// This is a function: async () => Promise<ProcessInfo>
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
} from "vs/base/parts/sandbox/electron-sandbox/globals";
import product from "vs/platform/product/common/product.js";
import type {
	IUserDataProfile,
	UseDefaultProfileFlags,
} from "vs/platform/userDataProfile/common/userDataProfile";
import type {
	IColorScheme,
	INativeWindowConfiguration,
	IOSConfiguration,
	// Keep original for reference
	IPartsSplash as VsCodeIPartsSplashOriginal,
} from "vs/platform/window/common/window";
import {
	reviveIdentifier,
	type IEmptyWorkspaceIdentifier,
	type ISingleFolderWorkspaceIdentifier,
	type IWorkspaceIdentifier,
} from "vs/platform/workspace/common/workspace.js";

// Local type declarations
interface ILocalProcessEnvironment {
	[key: string]: string | undefined;
}

// Using VSCode's internal UriDto definition would be better if possible,

// but this local one is a fallback.
interface ILocalUriDto<T = any> {
	// Marker for VSCode's URI revival logic
	$mid: 11;

	scheme: string;

	authority?: string;

	path?: string;

	query?: string;

	fragment?: string;

	external?: string;

	_formatted?: string | null;

	_fsPath?: string | null;

	payload?: T;
}

interface ILocalLoggerResource {
	resource: URI;

	// Changed from LogLevel to number to match common practice
	logLevel?: number;

	id: string;

	name: string;

	hidden?: boolean;

	when?: string;
}

// Define ILocalPartsSplash based on IPartsSplash
// This needs to satisfy the IPartsSplash expected by INativeWindowConfiguration
interface ILocalPartsSplash extends VsCodeIPartsSplashOriginal {
	// Ensure all required properties from VsCodeIPartsSplashOriginal are here.
	// If VsCodeIPartsSplashOriginal already has zoomLevel, baseTheme, etc., this can be simpler.
	// For this example, I'm assuming they are required and might not be on Partial.
	zoomLevel: number;

	// Assuming string, check original type
	baseTheme: string;

	colorInfo: {
		// Be more specific based on VsCodeIPartsSplashOriginal.colorInfo
		// Placeholder
		[key: string]: any;
	};

	layoutInfo: {
		// Be more specific based on VsCodeIPartsSplashOriginal.layoutInfo
		// Placeholder
		[key: string]: any;
	};
}

// Configuration properties that might be present in the meta tag settings
// but are not strictly part of INativeWindowConfiguration, or to ensure type safety.
interface ICustomWorkbenchConfiguration {
	availableLanguages?: Record<string, string>;

	pseudo?: boolean;

	// Allow raw or revived
	defaultProfile?: IUserDataProfile | ILocalUriDto<IUserDataProfile>;

	productConfiguration?: Partial<typeof product>;

	loggers?: Array<
		Partial<ILocalLoggerResource> & { resource: URI | ILocalUriDto }
	>;
}

declare const __DEV__: boolean;

// Unused
// declare const __VSCODE_VERSION__: string;

declare const __TAURI_APP_VERSION__: string;

declare const __NODE_ENV__: string;

// Unused
// declare const __TAURI_ENV_DEBUG__: string;

declare global {
	interface Window {
		vscode: IMainWindowSandboxGlobals;

		// Add other custom globals if necessary
	}
}

const LOG_PREFIX = "[TauriPreload]";

const Log = __DEV__ ? (...m: any[]) => console.log(LOG_PREFIX, ...m) : () => {};

const ErrorLog = __DEV__
	? (...m: any[]) => console.error(LOG_PREFIX, ...m)
	: () => {};

const WarnLog = __DEV__
	? (...m: any[]) => console.warn(LOG_PREFIX, ...m)
	: () => {};

Log("Script executing. DEV mode:", __DEV__);

/**
 * Represents the structure of environment variables expected by VSCode,

 * potentially augmented by Tauri-specific ones.
 */
interface TauriProcessEnv extends ILocalProcessEnvironment {
	VSCODE_CWD: string;

	VSCODE_NLS_CONFIG: string;

	VSCODE_DEV?: "1";

	// Add other specific VSCODE_ environment variables if known
}

/**
 * Recursively traverses an object or array and revives URI-like structures
 * (plain objects with 'scheme', 'path', etc.) into URI instances.
 * It specifically looks for keys known to hold URIs or URI-like objects.
 * @param data The data to traverse.
 * @returns The data with URI-like objects revived.
 */
function reviveProfileUrisRecursively(data: any): any {
	if (!data || typeof data !== "object") {
		return data;
	}

	if (Array.isArray(data)) {
		return data.map(reviveProfileUrisRecursively);
	}

	// VSCode's $mid property is a marker for special objects like URIs.
	// $mid: 1 is for URI, $mid: 11 is for UriDto.
	// GUEST_SCHEME_AUTHORITY_REGEXP is used by VSCode to identify guest session URIs.
	const GUEST_SCHEME_AUTHORITY_REGEXP =
		/^([a-zA-Z][a-zA-Z0-9+.-]*):(\/\/([^\\/?#]*))?/;

	if (
		typeof data.scheme === "string" &&
		(GUEST_SCHEME_AUTHORITY_REGEXP.test(data.scheme) ||
			typeof data.path === "string" ||
			typeof data.authority === "string" ||
			// Standard URI marker
			data.$mid === 1 ||
			// UriDto marker
			data.$mid === 11)
	) {
		// URI.revive can take a plain object and turn it into a URI instance
		return URI.revive(data);
	}

	const result: any = {};

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			const value = data[key];

			// Heuristics to identify properties that are likely URIs or contain URIs
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
				} else if (typeof value === "string") {
					// Attempt to parse string values as URIs, robustly
					try {
						// Check if it looks like a URI before parsing, to avoid errors with plain strings
						if (
							value.includes(":") ||
							value.startsWith("/") ||
							value.startsWith("\\\\")
						) {
							result[key] = URI.parse(value);
						} else {
							// Or just value if not a path
							result[key] = reviveProfileUrisRecursively(value);
						}
					} catch {
						// Fallback
						result[key] = reviveProfileUrisRecursively(value);
					}
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

		// Use tauriOsType
		const osTypeValueImpl: string = await tauriOsType();

		const osRelease: string = await tauriOsVersion();

		const appNameFromApi: string = await getTauriAppNameFromApi();

		const appVersionFromApi: string = await getTauriAppVersionFromApi();

		const tauriAppExeDir: string = await executableDir();

		const tauriResDir: string = await resourceDir();

		const nodeEnvFromDefine: string =
			typeof __NODE_ENV__ !== "undefined" ? __NODE_ENV__ : "production";

		// __TAURI_ENV_DEBUG__ was unused, using __DEV__ or nodeEnvFromDefine for similar logic
		const isDebugMode: boolean =
			__DEV__ || nodeEnvFromDefine === "development";

		const getWorkbenchConstructionOptions = (): Partial<
			INativeWindowConfiguration & ICustomWorkbenchConfiguration
		> => {
			const metaElement = document.getElementById(
				"vscode-workbench-web-configuration",
			);

			const settings = metaElement?.dataset?.["settings"];

			try {
				const parsed = settings ? JSON.parse(settings) : {};

				// Perform URI revival after parsing
				return reviveProfileUrisRecursively(parsed) as Partial<
					INativeWindowConfiguration & ICustomWorkbenchConfiguration
				>;
			} catch (e) {
				ErrorLog("Failed to parse workbench options from meta tag:", e);

				return {};
			}
		};

		const initialConfigFromMeta = getWorkbenchConstructionOptions();

		// Current working directory
		const vscodeCwd = await tauriResolve(".");

		const sandboxNodeProcessShim: ISandboxNodeProcess = {
			platform: platform,

			arch: arch,

			// Indicates this is a renderer process environment
			type: "renderer",

			versions: {
				node: currentProcessInfo.versions?.node || "N/A (Tauri Shim)",

				chrome:
					navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] ||
					"unknown",

				// Shim Electron version
				electron: "0.0.0-tauri",

				// App's own version
				[appNameFromApi]: appVersionFromApi,

				tauri:
					typeof __TAURI_APP_VERSION__ !== "undefined"
						? __TAURI_APP_VERSION__
						: appVersionFromApi,
			},

			env: {
				...(currentProcessInfo.env as ILocalProcessEnvironment),

				VSCODE_DEV: isDebugMode ? "1" : undefined,

				VSCODE_CWD: vscodeCwd,

				VSCODE_NLS_CONFIG: JSON.stringify({
					locale:
						initialConfigFromMeta.locale ||
						navigator.language ||
						"en",

					availableLanguages:
						initialConfigFromMeta.availableLanguages || {},

					// Use initialConfigFromMeta
					pseudo: initialConfigFromMeta.pseudo || false,
				}),
			} as TauriProcessEnv,

			execPath:
				currentProcessInfo.execPath ||
				(await tauriJoin(tauriAppExeDir, appNameFromApi)),

			on: (eventType: string, callback: Function) => {
				WarnLog(
					`Shim: process.on('${eventType}') called. Event not truly handled by Tauri.`,
				);

				// Potentially map to tauriListen for critical events if necessary
				// For chaining
				return sandboxNodeProcessShim;
			},

			// VSCode expects cwd() to be synchronous
			cwd: () => sandboxNodeProcessShim.env.VSCODE_CWD!,

			getProcessMemoryInfo: async (): Promise<ProcessMemoryInfo> => {
				// Tauri doesn't expose detailed process memory info like Electron.
				// Return zeroed or estimated values.
				WarnLog(
					"Shim: process.getProcessMemoryInfo() returning placeholder data.",
				);

				return { private: 0, residentSet: 0, shared: 0 };
			},

			shellEnv: async (): Promise<ILocalProcessEnvironment> => {
				WarnLog(
					"Shim: process.shellEnv() returning current env, not full shell env.",
				);

				// Tauri cannot directly get the "shell environment" like Electron.
				// Return the known environment.
				return {
					...sandboxNodeProcessShim.env,
				} as ILocalProcessEnvironment;
			},
		};

		const ipcRendererShimImpl: IpcRenderer = {
			send: (channel: string, ...args: any[]): void => {
				if (channel.startsWith("vscode:")) {
					// Fire-and-forget event
					tauriEmit(
						channel,

						args.length === 1 && args[0] !== undefined
							? args[0]
							: args,
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
					// Special handling for common VSCode invoke calls if needed
					if (channel === "vscode:fetchShellEnv") {
						WarnLog(
							"Shim: ipcRenderer.invoke('vscode:fetchShellEnv') returning current env.",
						);

						return {
							...sandboxNodeProcessShim.env,

							FROM_TAURI_SHELL_ENV_SHIM: "true",
						};
					}

					// Generic invoke to backend (requires a corresponding handler in Rust)
					// Note: VSCode often uses invoke for main->renderer communication too, which this doesn't cover.
					// This primarily shims renderer->main calls.
					try {
						// Assuming a generic rust command `handle_vscode_invoke` exists
						// Or map specific channels to specific invoke commands
						WarnLog(
							`Attempting generic IPC invoke for '${channel}' to Tauri backend. Args:`,

							args,
						);

						return await invoke(
							`vscode_ipc_invoke_${channel.replace(/^vscode:/, "")}`,

							{ payload: args.length === 1 ? args[0] : args },
						);
					} catch (e) {
						ErrorLog(`Error invoking IPC '${channel}':`, e);

						// VSCode might expect specific errors or undefined for unhandled channels
						// or return undefined;

						// throw e;

						return undefined;
					}
				}

				WarnLog(`Denying IPC invoke on non-vscode channel: ${channel}`);

				throw new Error(`Unsupported IPC invoke channel: ${channel}`);
			},

			on: (
				channel: string,

				listener: (event: any, ...args: any[]) => void,
			): IpcRenderer => {
				if (channel.startsWith("vscode:")) {
					tauriListen(channel, (event: TauriEvent<any>) => {
						// Shim the 'event' object Electron's ipcRenderer provides
						listener(
							{
								sender: ipcRendererShimImpl /* other event props if needed */,
							},

							event.payload,
						);
					}).catch((e) =>
						ErrorLog(`Error listening to IPC '${channel}':`, e),
					);
				} else {
					WarnLog(
						`Denying IPC listen on non-vscode channel: ${channel}`,
					);
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
							{ sender: ipcRendererShimImpl },

							event.payload,
						);
					}).catch((e) =>
						ErrorLog(
							`Error listening once to IPC '${channel}':`,

							e,
						),
					);
				} else {
					WarnLog(
						`Denying IPC listen once on non-vscode channel: ${channel}`,
					);
				}

				return ipcRendererShimImpl;
			},

			removeListener: (
				channel: string,

				listener: (...args: any[]) => void,
			): IpcRenderer => {
				// Tauri's `listen` returns an unlisten function. Managing these would require storing them.
				// For a basic shim, this can be a no-op with a warning.
				WarnLog(
					`Shim: ipcRenderer.removeListener for '${channel}' is not fully implemented. Listener may not be removed.`,
				);

				// To implement properly: store the unlisten function returned by tauriListen/tauriOnce
				// and call it here if the listener matches.
				return ipcRendererShimImpl;
			},

			// Add other methods if VSCode uses them, e.g., removeAllListeners
			removeAllListeners: (channel: string): IpcRenderer => {
				WarnLog(
					`Shim: ipcRenderer.removeAllListeners for '${channel}' is not implemented.`,
				);

				return ipcRendererShimImpl;
			},
		};

		const webFrameShimImpl: WebFrame = {
			setZoomLevel: async (level: number) => {
				try {
					// VSCode's zoom level is often `0` for default, `1` for one step larger, etc.
					// Web zoom factors are typically `1.0` for default, `1.1`, `1.2`.
					// This needs mapping if VSCode's level isn't directly a browser zoom factor.
					// Electron's zoom level is `log(factor) / log(1.2)`.
					// So, factor = Math.pow(1.2, level).
					// This shim might interact with a global zoom setting for the window.
					// For Tauri, you might need to invoke a backend command to set window zoom.
					Log(
						`Shim: webFrame.setZoomLevel(${level}) called. Tauri window zoom may need to be handled via invoke.`,
					);

					// Example: await invoke('set_window_zoom', { factor: Math.pow(1.2, level) });

					// Or, if CSS zoom is acceptable: document.body.style.zoom = `${Math.pow(1.2, level)}`;
				} catch (e) {
					ErrorLog(`Error setting zoom level via shim:`, e);
				}
			},

			// Add other WebFrame methods if used by VSCode
		};

		const sandboxContextImpl = (() => {
			let _resolvedConfiguration: ISandboxConfiguration | undefined =
				undefined;

			const configPromise = (async (): Promise<ISandboxConfiguration> => {
				if (_resolvedConfiguration) return _resolvedConfiguration;

				Log(
					"context.resolveConfiguration: Resolving sandbox configuration...",
				);

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

				const commonProfileProps: Pick<
					IUserDataProfile,
					| "globalStorageHome"
					| "settingsResource"
					| "keybindingsResource"
					| "tasksResource"
					| "snippetsHome"
					| "extensionsResource"
					| "promptsHome"
					| "cacheHome"
				> = {
					globalStorageHome: URI.file(
						await tauriJoin(
							defaultProfileLocation.fsPath,

							"globalStorage",
						),
					),

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

					promptsHome: URI.file(
						await tauriJoin(
							defaultProfileLocation.fsPath,

							"prompts",
						),
					),

					cacheHome: URI.file(
						await tauriJoin(defaultProfileLocation.fsPath, "cache"),
					),
				};

				const defaultUserDataProfile: IUserDataProfile = {
					id: "defaultProfile",

					name: "Default",

					isDefault: true,

					location: defaultProfileLocation,

					...commonProfileProps,

					// Ensure all flags are present or typed as optional
					useDefaultFlags: {} as UseDefaultProfileFlags,

					isTransient: false,
				};

				const defaultProfilesValue = {
					home: URI.file(
						await tauriJoin(tauriAppData, "User", "profiles"),
					),

					all: [
						URI.revive({
							...defaultUserDataProfile,

							$mid: 11,
						}) as ILocalUriDto<IUserDataProfile>,

						// Ensure DTO structure if needed
					],

					profile: defaultUserDataProfile,
				};

				const revivedLoggers: ILocalLoggerResource[] = (
					initialConfigFromMeta.loggers || []
				).map(
					(l: any): ILocalLoggerResource => ({
						// Ensure 'l' is properly typed or cast
						id: l.id || "default",

						name: l.name || "Default Logger",

						resource:
							l.resource instanceof URI
								? l.resource
								: URI.revive(
										l.resource || {
											scheme: "file",

											path: "/tmp/default.log",
										},
									),

						logLevel:
							typeof l.logLevel === "number"
								? l.logLevel
								: // Use VSCode LogLevel enum if possible
									undefined,

						hidden:
							typeof l.hidden === "boolean"
								? l.hidden
								: undefined,

						when: typeof l.when === "string" ? l.when : undefined,
					}),
				);

				// Workspace value handling
				let workspaceValueToSet:
					| IWorkspaceIdentifier
					| ISingleFolderWorkspaceIdentifier
					| IEmptyWorkspaceIdentifier
					| undefined;

				if (initialConfigFromMeta.workspace) {
					const revived = reviveIdentifier(
						initialConfigFromMeta.workspace,
					);

					// ISandboxConfiguration might not accept IEmptyWorkspaceIdentifier directly depending on VSCode version.
					// The error TS2322 implies ISandboxConfiguration['workspace'] is stricter.
					// If ISandboxConfiguration['workspace'] is `IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | undefined`
					if (
						revived &&
						"id" in revived &&
						!("configPath" in revived || "uri" in revived)
					) {
						// It's IEmptyWorkspaceIdentifier
						// Convert if target doesn't accept it
						workspaceValueToSet = undefined;

						WarnLog(
							"Converted IEmptyWorkspaceIdentifier to undefined for sandbox configuration.",
						);
					} else {
						workspaceValueToSet = revived as
							| IWorkspaceIdentifier
							| ISingleFolderWorkspaceIdentifier
							| IEmptyWorkspaceIdentifier
							| undefined;
					}
				} else {
					workspaceValueToSet = undefined;
				}

				const nativeConfig: INativeWindowConfiguration = {
					// Properties from initialConfigFromMeta should be spread first, then overridden if necessary
					// Cast if confident about the shape
					...(initialConfigFromMeta as INativeWindowConfiguration),

					windowId:
						initialConfigFromMeta.windowId ??
						Window.getCurrent().label ??
						// Ensure string or number as per type
						String(Date.now()),

					machineId: await invoke<string>("get_machine_id").catch(
						() => "tauri-machine-id-fallback",
					),

					sqmId: await invoke<string>("get_sqm_id").catch(
						() => "tauri-sqm-id-fallback",
					),

					sessionId: `tauri-session-${Date.now()}`,

					appRoot:
						initialConfigFromMeta.appRoot ||
						// Path to app resources
						(await tauriResolve(tauriResDir, ".")),

					logsPath:
						// Ensure URI if type expects URI
						initialConfigFromMeta.logsPath || URI.file(tauriLogs),

					userEnv: {
						...sandboxNodeProcessShim.env,

						...((initialConfigFromMeta.userEnv as ILocalProcessEnvironment) ||
							{}),
					} as ILocalProcessEnvironment,

					os: {
						arch: arch,

						// Placeholder
						hostname: "tauri.localhost",

						release: osRelease,

						platform: platform,

						// This was os.type()
						type: osTypeValueImpl,
					} as IOSConfiguration,

					colorScheme:
						initialConfigFromMeta.colorScheme ||
						({
							dark: window.matchMedia(
								"(prefers-color-scheme: dark)",
							).matches,

							highContrast: window.matchMedia(
								"(forced-colors: active)",

								// A common way to check HC
							).matches,
						} as IColorScheme),

					// Ensure paths are strings if INativeWindowConfiguration expects strings, or URIs if it expects URIs
					homeDir: initialConfigFromMeta.homeDir
						? typeof initialConfigFromMeta.homeDir === "string"
							? initialConfigFromMeta.homeDir
							: (initialConfigFromMeta.homeDir as URI).fsPath
						: tauriHome,

					tmpDir: initialConfigFromMeta.tmpDir
						? typeof initialConfigFromMeta.tmpDir === "string"
							? initialConfigFromMeta.tmpDir
							: (initialConfigFromMeta.tmpDir as URI).fsPath
						: osTypeValueImpl === "windows"
							? (await invoke<string | null>("get_env", {
									name: "TEMP",
								}).catch(() => "C:\\Temp")) || "C:\\Temp"
							: "/tmp",

					userDataDir: initialConfigFromMeta.userDataDir
						? typeof initialConfigFromMeta.userDataDir === "string"
							? initialConfigFromMeta.userDataDir
							: (initialConfigFromMeta.userDataDir as URI).fsPath
						: tauriAppData,

					workspace: workspaceValueToSet as
						| IWorkspaceIdentifier
						| ISingleFolderWorkspaceIdentifier
						// Use processed value
						| undefined,

					// Assuming 'folder-uri' and 'workspace-uri' are custom additions or specific to certain configs
					folderUri:
						initialConfigFromMeta["folder-uri"] instanceof URI
							? initialConfigFromMeta["folder-uri"]
							: undefined,

					// workspaceUri should align with 'workspace' if it's ISingleFolderWorkspaceIdentifier or IWorkspaceIdentifier
					workspaceUri:
						initialConfigFromMeta.workspaceUri instanceof URI
							? initialConfigFromMeta.workspaceUri
							: workspaceValueToSet &&
								  "configPath" in workspaceValueToSet
								? workspaceValueToSet.configPath
								: workspaceValueToSet &&
									  "uri" in workspaceValueToSet
									? workspaceValueToSet.uri
									: undefined,

					profiles: initialConfigFromMeta.profiles
						? reviveProfileUrisRecursively(
								initialConfigFromMeta.profiles,
							)
						: defaultProfilesValue,

					defaultProfile: initialConfigFromMeta.defaultProfile
						? (reviveProfileUrisRecursively(
								initialConfigFromMeta.defaultProfile,
							) as IUserDataProfile)
						: defaultUserDataProfile,

					loggers: revivedLoggers,

					autoDetectHighContrast:
						initialConfigFromMeta.autoDetectHighContrast ?? true,

					autoDetectColorScheme:
						initialConfigFromMeta.autoDetectColorScheme ?? true,

					zoomLevel:
						typeof initialConfigFromMeta.zoomLevel === "number"
							? initialConfigFromMeta.zoomLevel
							: 0,

					isCustomZoomLevel:
						initialConfigFromMeta.isCustomZoomLevel ??
						(initialConfigFromMeta.zoomLevel !== undefined &&
							initialConfigFromMeta.zoomLevel !== 0),

					productConfiguration: {
						// Base product.json
						...product,

						// Overlays from config
						...(initialConfigFromMeta.productConfiguration || {}),
					},

					accessibilitySupport:
						initialConfigFromMeta.accessibilitySupport === "on" ||
						initialConfigFromMeta.accessibilitySupport === "off" ||
						initialConfigFromMeta.accessibilitySupport === "auto"
							? initialConfigFromMeta.accessibilitySupport
							: // Default to auto or undefined if preferred
								"auto",

					perfMarks: initialConfigFromMeta.perfMarks || [],

					policiesData: initialConfigFromMeta.policiesData || {},

					partsSplash: initialConfigFromMeta.partsSplash
						? ({
								// Ensure all required fields of ILocalPartsSplash / VsCodeIPartsSplashOriginal are met
								zoomLevel:
									typeof initialConfigFromMeta.partsSplash
										.zoomLevel === "number"
										? initialConfigFromMeta.partsSplash
												.zoomLevel
										: 0,

								baseTheme:
									// Provide a sensible default
									initialConfigFromMeta.partsSplash
										.baseTheme || "vs-dark",

								colorInfo:
									// Default
									initialConfigFromMeta.partsSplash
										.colorInfo || {},

								layoutInfo:
									// Default
									initialConfigFromMeta.partsSplash
										.layoutInfo || {},

								// Spread the rest
								...(initialConfigFromMeta.partsSplash as Partial<ILocalPartsSplash>),
							} as ILocalPartsSplash)
						: ({
								zoomLevel: 0,

								// Default theme
								baseTheme: "vs-dark",

								// Default color info
								colorInfo: {},

								// Default layout info
								layoutInfo: {},
							} as ILocalPartsSplash),
				};

				// Cast assuming INativeWindowConfiguration is compatible
				_resolvedConfiguration = nativeConfig as ISandboxConfiguration;

				Log("Sandbox configuration resolved:", _resolvedConfiguration);

				return _resolvedConfiguration;
			})();

			return {
				configuration: () => {
					// WarnLog("Accessing sandbox configuration directly (context.configuration()). May not be fully resolved if called too early.");

					return _resolvedConfiguration;
				},

				resolveConfiguration: () => configPromise,
			};
		})();

		const webUtilsShimImpl: WebUtils = {
			getPathForFile: (file: File): string => {
				// `(file as any).path` is a non-standard property sometimes added by Electron/Node webviews for drag-and-drop.
				// For Tauri, this might not be available. File objects from <input type="file"> don't have .path.
				// This shim might be problematic if VSCode relies heavily on it for arbitrary File objects.
				WarnLog(
					`Shim: webUtils.getPathForFile(${file.name}). Path property might not be available.`,
				);

				// Fallback to name, which is not a path
				return (file as any).path || file.name;
			},

			// Add other WebUtils methods if used
		};

		const ipcMessagePortShimImpl: IpcMessagePort = {
			acquire: (responseChannel: string, nonce: string): void => {
				// This is related to Electron's MessageChannelMain for more complex IPC.
				// Tauri doesn't have a direct equivalent. This would require significant backend setup.
				WarnLog(
					`Shim: ipcMessagePort.acquire('${responseChannel}', '${nonce}') called. Not implemented for Tauri.`,
				);

				// Potentially, emit an event to the backend to set up a channel if this is critical.
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

		// Expose the shims to the window object for VSCode's sandboxed renderer
		window.vscode = globals;

		Log("window.vscode shims attached successfully.");
	} catch (error) {
		ErrorLog("Fatal error during preload script execution:", error);

		// Display error in the UI as a fallback
		const errDiv = document.createElement("div");

		errDiv.textContent = `Tauri Preload Error: ${error instanceof Error ? error.message : String(error)}. Check developer console for details.`;

		errDiv.style.cssText =
			"position:fixed;top:0;left:0;width:100%;padding:20px;background-color:red;color:white;font-family:sans-serif;font-size:16px;z-index:9999;white-space:pre-wrap;text-align:center;";

		if (document.body) {
			document.body.prepend(errDiv);
		} else {
			window.addEventListener("DOMContentLoaded", () =>
				document.body.prepend(errDiv),
			);
		}
	}
})();

// Ensures this is treated as a module
export {};
