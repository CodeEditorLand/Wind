import {
	emit as tauriEmit,
	listen as tauriListen,
	once as tauriOnce,
	type Event as TauriEvent,
} from "@tauri-apps/api/event";
// This one seems to be found generally
import { Window } from "@tauri-apps/api/window";
// --- VSCode Type Imports ---
import { URI, UriComponents, UriDto } from "vs/base/common/uri";
import type { ISandboxConfiguration } from "vs/base/parts/sandbox/common/sandboxTypes";
import type {
	// This is the target interface to shim
	IpcRenderer,
	// VSCode's specific type
	ProcessMemoryInfo as VsProcessMemoryInfo,
	WebFrame,
	WebUtils,
} from "vs/base/parts/sandbox/electron-sandbox/electronTypes";
import type {
	IMainWindowSandboxGlobals,
	IpcMessagePort,
	ISandboxNodeProcess,
} from "vs/base/parts/sandbox/electron-sandbox/globals";
// Types from vs/platform/log/common/log.ts (assuming ILoggerResource comes from here or similar)
import type { ILoggerResource, LogLevel } from "vs/platform/log/common/log";
import product from "vs/platform/product/common/product.js";
import { ThemeTypeSelector } from "vs/platform/theme/common/theme";
import type {
	// Assuming IUserDataProfile is correctly imported
	IUserDataProfile,
	UseDefaultProfileFlags,
} from "vs/platform/userDataProfile/common/userDataProfile";
// Types from vs/platform/window/common/window.ts
import type {
	IColorScheme,
	INativeWindowConfiguration,
	IOSConfiguration,
} from "vs/platform/window/common/window";
// Types from vs/platform/workspace/common/workspace.ts
import {
	// Function to revive workspace identifiers
	reviveIdentifier,
	type ISingleFolderWorkspaceIdentifier,
	type IWorkspaceIdentifier,
} from "vs/platform/workspace/common/workspace.js";

// Preload.ts

// --- Tauri API Imports ---
// Mocking these for now as per your request to ignore TS2307 for this pass
const mockTauriApi = {
	getTauriAppNameFromApi: async () => "mock-app",

	getTauriAppVersionFromApi: async () => "0.0.0",

	invoke: async (_cmd: string, _args?: any) => undefined,

	tauriOsArch: async () => "x86_64",

	// e.g., 'linux', 'darwin', 'windows'
	tauriOsPlatform: async () => "darwin",

	// e.g., 'Linux', 'Darwin', 'Windows_NT'
	tauriOsType: async () => "Darwin",

	tauriOsVersion: async () => "mock-os-version",

	appDataDir: async () => "/mock/appDataDir",

	appLogDir: async () => "/mock/appLogDir",

	executableDir: async () => "/mock/executableDir",

	homeDir: async () => "/mock/homeDir",

	resourceDir: async () => "/mock/resourceDir",

	// Simplified mock
	tauriJoin: async (...paths: string[]) => paths.join("/"),

	// Simplified mock
	tauriResolve: async (...paths: string[]) => paths.join("/"),

	getCurrentProcess: async (): Promise<any> => ({
		// ProcessInfo from @tauri-apps/api/process
		arch: "x64",

		execPath: "/mock/execPath",

		pid: 1,

		env: {},

		cwd: "/mock",

		// Tauri's ProcessMemoryInfo might differ slightly
		memory: { rss: 0, total: 0 },

		versions: {
			node: "mock-node",

			tauri: "mock-tauri",

			webview: "mock-webview",

			// Adjust as per actual ProcessInfo
		},
	}),
};

// Local type declarations
interface ILocalProcessEnvironment {
	[key: string]: string | undefined;
}

// This DTO is for data transfer, often what JSON.parse yields before URI.revive
// UriDto<T> is also defined in VSCode, if this matches, could use that.
interface ILocalUriDto<T = any> {
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

// Configuration properties that might be present in the meta tag settings
// but are not strictly part of INativeWindowConfiguration, or to ensure type safety.
interface ICustomWorkbenchConfiguration {
	availableLanguages?: Record<string, string>;

	pseudo?: boolean;

	// Use UriDto if it's serialized
	defaultProfile?: IUserDataProfile | UriDto<IUserDataProfile>;

	productConfiguration?: Partial<typeof product>;

	// Loggers are UriDto<ILoggerResource> in INativeWindowConfiguration
	loggers?: Array<
		Partial<ILoggerResource> & { resource: URI | UriDto<ILoggerResource> }
	>;

	// accessibilitySupport is boolean | undefined in INativeWindowConfiguration
	// If meta tag has string 'on'/'off', it needs conversion.
	accessibilitySupportOverride?: "on" | "off" | "auto" | string;

	// If this is a custom property you expect for workspace override
	workspaceUri?: URI | UriDto<any>;
}

declare const __DEV__: boolean;

// Declared by Tauri build
declare const __TAURI_APP_VERSION__: string;

// Typically set by bundler (e.g., Vite, Webpack)
declare const __NODE_ENV__: string;

declare global {
	interface Window {
		vscode: IMainWindowSandboxGlobals;
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

interface TauriProcessEnv extends ILocalProcessEnvironment {
	VSCODE_CWD: string;

	VSCODE_NLS_CONFIG: string;

	VSCODE_DEV?: "1";
}

function reviveProfileUrisRecursively(data: any): any {
	if (!data || typeof data !== "object") {
		return data;
	}
	if (Array.isArray(data)) {
		return data.map(reviveProfileUrisRecursively);
	}

	const GUEST_SCHEME_AUTHORITY_REGEXP =
		// More specific for VSCode
		/^vscode-remote-guest:(\/\/([^\\/?#]*))?/;

	if (
		(typeof data.scheme === "string" &&
			(data.scheme === "file" ||
				data.scheme === "vscode-userdata" ||
				GUEST_SCHEME_AUTHORITY_REGEXP.test(data.scheme))) ||
		// Standard URI marker for VSCode's internal objects
		data.$mid === 1 ||
		// UriDto marker
		data.$mid === 11
	) {
		// URI.revive can take UriComponents or objects with $mid and relevant URI properties
		// Cast as UriComponents to satisfy revive
		return URI.revive(data as UriComponents);
	}

	const result: any = {};

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			const value = data[key];

			// Adjusted heuristic based on common VSCode patterns
			if (
				(key.endsWith("Uri") ||
					key.endsWith("Resource") ||
					key.endsWith("Home") ||
					key === "location" ||
					key === "resource" ||
					key === "home" ||
					key === "uri") &&
				// Ensure value is not null/undefined
				value
			) {
				if (value instanceof URI) {
					// Already a URI instance
					result[key] = value;
				} else if (
					typeof value === "object" &&
					typeof value.scheme === "string"
				) {
					result[key] = URI.revive(value as UriComponents);
				} else if (typeof value === "string") {
					try {
						// More robust check for potential URI strings
						if (
							value.includes(":") ||
							value.startsWith("/") ||
							value.startsWith("\\\\") ||
							/^[a-zA-Z]:\\/.test(value)
						) {
							result[key] = URI.parse(value);
						} else {
							// Not a parseable URI string
							result[key] = value;
						}
					} catch {
						// Parsing failed, keep original string
						result[key] = value;
					}
				} else {
					// Recurse for nested objects
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
		const currentProcessInfo = await mockTauriApi.getCurrentProcess();

		const platform = await mockTauriApi.tauriOsPlatform();

		const arch = await mockTauriApi.tauriOsArch();

		// e.g. Darwin, Linux, Windows_NT
		const osTypeValueImpl = await mockTauriApi.tauriOsType();

		const osRelease = await mockTauriApi.tauriOsVersion();

		const appNameFromApi = await mockTauriApi.getTauriAppNameFromApi();

		const appVersionFromApi =
			await mockTauriApi.getTauriAppVersionFromApi();

		const tauriAppExeDir = await mockTauriApi.executableDir();

		const tauriResDir = await mockTauriApi.resourceDir();

		const nodeEnvFromDefine: string =
			typeof __NODE_ENV__ !== "undefined" ? __NODE_ENV__ : "production";

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

				return reviveProfileUrisRecursively(parsed) as Partial<
					INativeWindowConfiguration & ICustomWorkbenchConfiguration
				>;
			} catch (e) {
				ErrorLog("Failed to parse workbench options from meta tag:", e);

				return {};
			}
		};

		const initialConfigFromMeta = getWorkbenchConstructionOptions();

		const vscodeCwd = await mockTauriApi.tauriResolve(".");

		const sandboxNodeProcessShim: ISandboxNodeProcess = {
			platform:
				platform === "darwin"
					? "darwin"
					: platform === "windows"
						? "win32"
						: // Match Node.js platform strings
							"linux",

			// e.g., x64, arm64
			arch: arch,

			type: "renderer",

			versions: {
				// Provide a somewhat modern Node version
				node: currentProcessInfo.versions?.node || "18.0.0",

				chrome:
					navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] ||
					// Typical Chrome version
					"100.0.0.0",

				// Shim Electron version
				electron: "0.0.0-tauri",

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

					pseudo: initialConfigFromMeta.pseudo || false,
				}),
			} as TauriProcessEnv,

			execPath:
				currentProcessInfo.execPath ||
				(await mockTauriApi.tauriJoin(tauriAppExeDir, appNameFromApi)),

			on: (_eventType: string, _callback: Function) => {
				WarnLog(`Shim: process.on('${_eventType}') called.`);

				return sandboxNodeProcessShim;
			},

			cwd: () =>
				(sandboxNodeProcessShim.env as TauriProcessEnv)["VSCODE_CWD"]!,

			getProcessMemoryInfo: async (): Promise<VsProcessMemoryInfo> => {
				WarnLog(
					"Shim: process.getProcessMemoryInfo() returning placeholder data.",
				);

				// Match VsProcessMemoryInfo
				return { private: 0, residentSet: 0, shared: 0 };
			},

			shellEnv: async (): Promise<ILocalProcessEnvironment> => {
				WarnLog(
					"Shim: process.shellEnv() returning current env, not full shell env.",
				);

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
					if (channel === "vscode:fetchShellEnv") {
						WarnLog(
							"Shim: ipcRenderer.invoke('vscode:fetchShellEnv') returning current env.",
						);

						return {
							...(sandboxNodeProcessShim.env as TauriProcessEnv),

							FROM_TAURI_SHELL_ENV_SHIM: "true",
						};
					}
					WarnLog(
						`IPC Invoke: Unhandled vscode channel '${channel}'. Args:`,

						args,
					);

					try {
						// Attempt a generic invoke if a convention is established
						return await mockTauriApi.invoke(
							`vscode_ipc:${channel.substring(7)}`,

							{ args },
						);
					} catch (e) {
						ErrorLog(`Error invoking generic IPC '${channel}':`, e);

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
					tauriListen(channel, (event: TauriEvent<any>) =>
						listener(
							{ sender: ipcRendererShimImpl },

							event.payload,
						),
					).catch((e) =>
						ErrorLog(`Error listening to IPC '${channel}':`, e),
					);
				}
				return ipcRendererShimImpl;
			},

			once: (
				channel: string,

				listener: (event: any, ...args: any[]) => void,
			): IpcRenderer => {
				if (channel.startsWith("vscode:")) {
					tauriOnce(channel, (event: TauriEvent<any>) =>
						listener(
							{ sender: ipcRendererShimImpl },

							event.payload,
						),
					).catch((e) =>
						ErrorLog(
							`Error listening once to IPC '${channel}':`,

							e,
						),
					);
				}
				return ipcRendererShimImpl;
			},

			removeListener: (
				_channel: string,

				_listener: (...args: any[]) => void,
			): IpcRenderer => {
				WarnLog(
					`Shim: ipcRenderer.removeListener for '${_channel}' is not implemented.`,
				);

				return ipcRendererShimImpl;
			},

			// removeAllListeners: Removed because TS2561 indicates it's not on VSCode's IpcRenderer type
		};

		const webFrameShimImpl: WebFrame = {
			setZoomLevel: async (_level: number) => {
				Log(
					`Shim: webFrame.setZoomLevel(${_level}) called. Needs Tauri window integration.`,
				);
			},
		};

		const sandboxContextImpl = (() => {
			let _resolvedConfiguration: ISandboxConfiguration | undefined =
				undefined;

			const configPromise = (async (): Promise<ISandboxConfiguration> => {
				if (_resolvedConfiguration) return _resolvedConfiguration;

				Log(
					"context.resolveConfiguration: Resolving sandbox configuration...",
				);

				const tauriHome = await mockTauriApi.homeDir();

				const tauriAppData = await mockTauriApi.appDataDir();

				// This is a path string
				const tauriLogsPath = await mockTauriApi.appLogDir();

				const defaultProfileLocation = URI.file(
					await mockTauriApi.tauriJoin(
						tauriAppData,

						"User",

						"profiles",

						"defaultProfile",
					),
				);

				const commonProfilePropsFactory = async (
					profileLocation: URI,
				): Promise<
					Pick<
						IUserDataProfile,
						| "globalStorageHome"
						| "settingsResource"
						| "keybindingsResource"
						| "tasksResource"
						| "snippetsHome"
						| "extensionsResource"
						| "promptsHome"
						| "cacheHome"
					>
				> => ({
					globalStorageHome: URI.file(
						await mockTauriApi.tauriJoin(
							profileLocation.fsPath,

							"globalStorage",
						),
					),

					settingsResource: URI.file(
						await mockTauriApi.tauriJoin(
							profileLocation.fsPath,

							"settings.json",
						),
					),

					keybindingsResource: URI.file(
						await mockTauriApi.tauriJoin(
							profileLocation.fsPath,

							"keybindings.json",
						),
					),

					tasksResource: URI.file(
						await mockTauriApi.tauriJoin(
							profileLocation.fsPath,

							"tasks.json",
						),
					),

					snippetsHome: URI.file(
						await mockTauriApi.tauriJoin(
							profileLocation.fsPath,

							"snippets",
						),
					),

					extensionsResource: URI.file(
						await mockTauriApi.tauriJoin(
							profileLocation.fsPath,

							"extensions.json",
						),
					),

					promptsHome: URI.file(
						await mockTauriApi.tauriJoin(
							profileLocation.fsPath,

							"prompts",
						),
					),

					cacheHome: URI.file(
						await mockTauriApi.tauriJoin(
							profileLocation.fsPath,

							"cache",
						),
					),
				});

				const defaultProfileCommonProps =
					await commonProfilePropsFactory(defaultProfileLocation);

				const defaultUserDataProfile: IUserDataProfile = {
					id: "defaultProfile",

					name: "Default",

					isDefault: true,

					location: defaultProfileLocation,

					...defaultProfileCommonProps,

					useDefaultFlags: {} as UseDefaultProfileFlags,

					isTransient: false,
				};

				const profileToUriDto = (
					profile: IUserDataProfile,
				): UriDto<IUserDataProfile> => {
					// UriDto<T> typically means the URI itself carries the payload, or the URI points to it.
					// VSCode's UriDto often uses the URI components directly.
					return {
						// Marker for UriDto
						$mid: 11,

						// Spread components of the location URI
						...profile.location.toJSON(),

						// The payload is the full profile
						payload: profile,
					};
				};

				const defaultProfilesValue = {
					// Matches INativeWindowConfiguration.profiles
					home: defaultProfileLocation.with({
						path: await mockTauriApi.tauriJoin(
							tauriAppData,

							"User",

							"profiles",
						),

						// URI to profiles home
					}),

					all: [
						profileToUriDto(defaultUserDataProfile),
					] as ReadonlyArray<UriDto<IUserDataProfile>>,

					profile: profileToUriDto(
						defaultUserDataProfile,
					) as UriDto<IUserDataProfile>,
				};

				// INativeWindowConfiguration.loggers expects UriDto<ILoggerResource>[]
				const revivedLoggers: UriDto<ILoggerResource>[] = (
					initialConfigFromMeta.loggers || []
				).map((l): UriDto<ILoggerResource> => {
					const resourceUri =
						l.resource instanceof URI
							? l.resource
							: URI.revive(
									(l.resource as UriComponents) || {
										scheme: "file",

										path: "/tmp/default.log",
									},
								);

					const loggerPayload: ILoggerResource = {
						id: l.id || "default",

						name: l.name || "Default Logger",

						resource: resourceUri,

						// Cast to VSCode's LogLevel
						logLevel: l.logLevel as LogLevel | undefined,

						hidden:
							typeof l.hidden === "boolean"
								? l.hidden
								: undefined,

						when: typeof l.when === "string" ? l.when : undefined,
					};

					return {
						$mid: 11,

						// URI of the log file itself
						...resourceUri.toJSON(),

						payload: loggerPayload,
					};
				});

				let workspaceToSet:
					| IWorkspaceIdentifier
					| ISingleFolderWorkspaceIdentifier
					| undefined;

				if (initialConfigFromMeta.workspace) {
					const revived = reviveIdentifier(
						initialConfigFromMeta.workspace,
					);

					// INativeWindowConfiguration.workspace does not accept IEmptyWorkspaceIdentifier
					if (
						revived &&
						"id" in revived &&
						!("configPath" in revived || "uri" in revived) &&
						!("transient" in revived)
					) {
						workspaceToSet = undefined;

						WarnLog(
							"Converted IEmptyWorkspaceIdentifier to undefined for INativeWindowConfiguration.workspace.",
						);
					} else {
						workspaceToSet = revived as
							| IWorkspaceIdentifier
							| ISingleFolderWorkspaceIdentifier
							| undefined;
					}
				} else {
					workspaceToSet = undefined;
				}

				const nativeConfig: INativeWindowConfiguration = {
					// Properties from NativeParsedArgs (assuming initialConfigFromMeta has them)
					"folder-uri": initialConfigFromMeta["folder-uri"] as
						| UriDto<any>[]
						// Adjust type as per NativeParsedArgs
						| undefined,

					"file-uri": initialConfigFromMeta["file-uri"] as
						| UriDto<any>[]
						| undefined,

					"workspace-uri": initialConfigFromMeta["workspace-uri"] as
						| UriDto<any>[]
						| undefined,

					// ... other NativeParsedArgs fields ...
					// Positional arguments
					_: initialConfigFromMeta._ || [],

					diff: initialConfigFromMeta.diff,

					merge: initialConfigFromMeta.merge,

					add: initialConfigFromMeta.add,

					goto: initialConfigFromMeta.goto,

					// ... and many more from NativeParsedArgs, ensure they are present or optional

					// Properties from ISandboxConfiguration
					windowId:
						initialConfigFromMeta.windowId ??
						Window.getCurrent().label ??
						// Ensure string or number
						String(Date.now()),

					// Example
					parentPid: initialConfigFromMeta.parentPid || 0,

					// Properties from INativeWindowConfiguration itself
					// Example from current process
					mainPid: currentProcessInfo.pid || 0,

					machineId: (await mockTauriApi
						.invoke("get_machine_id")
						.catch(() => "tauri-machine-id-fallback")) as string,

					sqmId: (await mockTauriApi
						.invoke("get_sqm_id")
						.catch(() => "tauri-sqm-id-fallback")) as string,

					devDeviceId: (await mockTauriApi
						.invoke("get_dev_device_id")
						// Example
						.catch(() => "tauri-dev-device-id-fallback")) as string,

					execPath: sandboxNodeProcessShim.execPath,

					backupPath:
						initialConfigFromMeta.backupPath ||
						(await mockTauriApi.tauriJoin(tauriAppData, "Backups")),

					profiles: defaultProfilesValue,

					// Paths must be strings
					homeDir:
						typeof initialConfigFromMeta.homeDir === "string"
							? initialConfigFromMeta.homeDir
							: initialConfigFromMeta.homeDir &&
								  initialConfigFromMeta.homeDir instanceof URI
								? initialConfigFromMeta.homeDir.fsPath
								: tauriHome,

					tmpDir:
						typeof initialConfigFromMeta.tmpDir === "string"
							? initialConfigFromMeta.tmpDir
							: initialConfigFromMeta.tmpDir &&
								  initialConfigFromMeta.tmpDir instanceof URI
								? initialConfigFromMeta.tmpDir.fsPath
								: osTypeValueImpl === "Windows_NT"
									? ((await mockTauriApi
											.invoke("get_env", { name: "TEMP" })
											.catch(() => "C:\\Temp")) as string)
									: "/tmp",

					userDataDir:
						typeof initialConfigFromMeta.userDataDir === "string"
							? initialConfigFromMeta.userDataDir
							: initialConfigFromMeta.userDataDir &&
								  initialConfigFromMeta.userDataDir instanceof
										URI
								? initialConfigFromMeta.userDataDir.fsPath
								: tauriAppData,

					partsSplash: initialConfigFromMeta.partsSplash
						? ({
								mainProcessDark:
									!!initialConfigFromMeta.partsSplash
										.mainProcessDark,

								mainProcessHighContrast:
									!!initialConfigFromMeta.partsSplash
										.mainProcessHighContrast,

								keyboardLayoutInfo:
									// Provide default
									initialConfigFromMeta.partsSplash
										.keyboardLayoutInfo || {},

								menubarControlPlaceholderTitle:
									!!initialConfigFromMeta.partsSplash
										.menubarControlPlaceholderTitle,

								zoomLevel:
									initialConfigFromMeta.partsSplash
										.zoomLevel === undefined
										? undefined
										: Number(
												initialConfigFromMeta
													.partsSplash.zoomLevel,
											),

								// Use VsCodeThemeType
								baseTheme: (initialConfigFromMeta.partsSplash
									.baseTheme ||
									"vs-dark") as ThemeTypeSelector,

								colorInfo: initialConfigFromMeta.partsSplash
									.colorInfo || {
									background: "#1e1e1e",

									foreground: "#d4d4d4",

									editorBackground: "#1e1e1e",

									titleBarBackground: "#3c3c3c",

									activityBarBackground: "#333333",

									sideBarBackground: "#252526",

									statusBarBackground: "#007acc",

									statusBarNoFolderBackground: "#68217a",

									// More complete default
								},

								layoutInfo:
									// It's optional
									initialConfigFromMeta.partsSplash
										.layoutInfo || undefined,

								// Use VSCode's IPartsSplash directly
							} as IPartsSplash)
						: // partsSplash is optional
							undefined,

					// Use the processed value (IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | undefined)
					workspace: workspaceToSet,

					logLevel:
						(initialConfigFromMeta.logLevel as LogLevel) ||
						// Cast to VSCode's LogLevel
						LogLevel.Info,

					// UriDto<ILoggerResource>[]
					loggers: revivedLoggers,

					colorScheme:
						initialConfigFromMeta.colorScheme ||
						({
							dark: window.matchMedia(
								"(prefers-color-scheme: dark)",
							).matches,

							highContrast: window.matchMedia(
								"(forced-colors: active)",
							).matches,
						} as IColorScheme),

					autoDetectHighContrast:
						initialConfigFromMeta.autoDetectHighContrast ?? true,

					autoDetectColorScheme:
						initialConfigFromMeta.autoDetectColorScheme ?? true,

					// accessibilitySupport is boolean | undefined in INativeWindowConfiguration
					accessibilitySupport:
						initialConfigFromMeta.accessibilitySupportOverride ===
						"on"
							? true
							: initialConfigFromMeta.accessibilitySupportOverride ===
								  "off"
								? false
								: undefined,

					isCustomZoomLevel:
						initialConfigFromMeta.isCustomZoomLevel ??
						(initialConfigFromMeta.zoomLevel !== undefined &&
							initialConfigFromMeta.zoomLevel !== 0),

					perfMarks: initialConfigFromMeta.perfMarks || [],

					os: {
						arch,

						hostname: "tauri.localhost",

						release: osRelease,

						// platform is not part of IOSConfiguration
					} as IOSConfiguration,

					// Fill in other INativeWindowConfiguration properties or ensure they are optional
					fullscreen: initialConfigFromMeta.fullscreen ?? false,

					maximized: initialConfigFromMeta.maximized ?? false,

					isInitialStartup:
						initialConfigFromMeta.isInitialStartup ?? true,

					policiesData: initialConfigFromMeta.policiesData || {},

					// filesToOpenOrCreate, filesToDiff, filesToMerge, filesToWait come from NativeParsedArgs, should be handled if present in initialConfigFromMeta
				};

				// Cast: INativeWindowConfiguration IS ISandboxConfiguration
				_resolvedConfiguration = nativeConfig as ISandboxConfiguration;

				Log("Sandbox configuration resolved:", _resolvedConfiguration);

				return _resolvedConfiguration;
			})();

			return {
				configuration: () => _resolvedConfiguration,

				resolveConfiguration: () => configPromise,
			};
		})();

		const webUtilsShimImpl: WebUtils = {
			getPathForFile: (f) => (f as any).path || f.name,
		};

		const ipcMessagePortShimImpl: IpcMessagePort = {
			acquire: (_r, _n) =>
				WarnLog("ipcMessagePort.acquire not implemented"),
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

		Log("window.vscode shims attached successfully.");
	} catch (error: any) {
		// Catch as any or unknown
		const errorMessage =
			error instanceof Error ? error.message : String(error);

		ErrorLog(
			"Fatal error during preload script execution:",

			errorMessage,

			error.stack || error,
		);

		const errDiv = document.createElement("div");

		errDiv.textContent = `Tauri Preload Error: ${errorMessage}. Check developer console.`;

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
