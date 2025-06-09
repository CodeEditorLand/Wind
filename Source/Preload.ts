/*
 * File: Wind/Source/Preload.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 23:30:31 UTC
 * Dependency: @tauri-apps/api/window, vs/base/common/uri, vs/base/parts/sandbox/common/sandboxTypes, vs/platform/log/common/log, vs/platform/product/common/product, vs/platform/theme/common/theme, vs/platform/theme/common/themeService
 */

import {
	emit as tauriEmit,
	listen as tauriListen,
	once as tauriOnce,
	type Event as TauriEvent,
} from "@tauri-apps/api/event";
import { Window } from "@tauri-apps/api/window";
// --- VSCode Type Imports ---
import { URI, UriComponents, UriDto } from "vs/base/common/uri";
import type { ISandboxConfiguration } from "vs/base/parts/sandbox/common/sandboxTypes";
import type {
	// Note: VSCode's IpcRendererEvent might be needed for full compatibility
	IpcRenderer,
	// Assuming VSCode exports this or a compatible type
	IpcRendererEvent,
	ProcessMemoryInfo as VsProcessMemoryInfo,
	WebFrame,
	WebUtils,
} from "vs/base/parts/sandbox/electron-sandbox/electronTypes";
import type {
	IMainWindowSandboxGlobals,
	IpcMessagePort,
	ISandboxNodeProcess,
} from "vs/base/parts/sandbox/electron-sandbox/globals";
// Value import for LogLevel
import { LogLevel, type ILoggerResource } from "vs/platform/log/common/log";
import product from "vs/platform/product/common/product";
import { ThemeTypeSelector as VsCodeThemeTypeSelector } from "vs/platform/theme/common/theme";
import { IPartsSplash } from "vs/platform/theme/common/themeService";
import type {
	IUserDataProfile,
	UseDefaultProfileFlags,
} from "vs/platform/userDataProfile/common/userDataProfile";
import type {
	IColorScheme,
	INativeWindowConfiguration,
	IOSConfiguration,
} from "vs/platform/window/common/window";
import {
	reviveIdentifier,
	type ISingleFolderWorkspaceIdentifier,
	type IWorkspaceIdentifier,
} from "vs/platform/workspace/common/workspace";

// Preload.ts

// --- Tauri API Imports ---
// Using mocks to bypass TS2307 for this pass. Replace with actual imports when env is fixed.
const mockTauriApi = {
	getTauriAppNameFromApi: async () => "mock-app",

	getTauriAppVersionFromApi: async () => "0.0.0",

	invoke: async (_cmd: string, _args?: any): Promise<any> => undefined,

	tauriOsArch: async () => "x86_64",

	tauriOsPlatform: async () => "darwin",

	tauriOsType: async () => "Darwin",

	tauriOsVersion: async () => "mock-os-version",

	appDataDir: async () => "/mock/appDataDir",

	appLogDir: async () => "/mock/appLogDir",

	executableDir: async () => "/mock/executableDir",

	homeDir: async () => "/mock/homeDir",

	resourceDir: async () => "/mock/resourceDir",

	tauriJoin: async (...paths: string[]) => paths.join("/"),

	tauriResolve: async (...paths: string[]) => paths.join("/"),

	getCurrentProcess: async (): Promise<any> => ({
		arch: "x64",

		execPath: "/mock/execPath",

		pid: 1,

		env: {},

		cwd: "/mock",

		memory: { rss: 0, total: 0 },

		versions: {
			node: "mock-node",

			tauri: "mock-tauri",

			webview: "mock-webview",
		},
	}),
};

// Local type declarations
interface ILocalProcessEnvironment {
	[key: string]: string | undefined;
}

// This DTO is for data transfer, often what JSON.parse yields before URI.revive
// It's a local version if VSCode's UriDto<T> is too complex for initial parsing.
// However, INativeWindowConfiguration uses UriDto<T> directly.
// We will aim to construct objects compatible with VSCode's UriDto<T>.

// Configuration properties from the meta tag
interface ICustomWorkbenchConfiguration {
	availableLanguages?: Record<string, string>;

	pseudo?: boolean;

	// For profiles, INativeWindowConfiguration expects UriDto<IUserDataProfile>
	// Data from meta could be already revived or raw DTO
	defaultProfile?: IUserDataProfile | UriDto<IUserDataProfile>;

	productConfiguration?: Partial<typeof product>;

	// For loggers, INativeWindowConfiguration expects UriDto<ILoggerResource>[]
	loggers?: Array<
		Partial<ILoggerResource> & { resource: URI | UriDto<ILoggerResource> }

		// Data from meta
	>;

	// To be converted to boolean for INativeWindowConfiguration
	accessibilitySupportOverride?: "on" | "off" | "auto" | string;

	// Allow UriComponents if revived early
	"folder-uri"?: string[] | UriComponents[];

	"file-uri"?: string[] | UriComponents[];

	"workspace-uri"?: string[] | UriComponents[];

	// Positional arguments from NativeParsedArgument
	_?: string[];

	diff?: boolean;

	add?: boolean;

	merge?: boolean;

	// NativeParsedArgument
	goto?: boolean;

	// From INativeWindowConfiguration
	locale?: string;

	// For ISandboxConfiguration
	parentPid?: number;

	// For INativeWindowConfiguration
	backupPath?: string;

	// Add other fields from INativeWindowConfiguration / NativeParsedArgument if they come via meta tag
	// Allow other properties
	[key: string]: any;
}

declare const __DEV__: boolean;

declare const __TAURI_APP_VERSION__: string;

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

// Helper to create a mock IpcRendererEvent
const createMockIpcEvent = (
	sender: IpcRenderer,
): Partial<IpcRendererEvent> => ({
	// Use Partial if IpcRendererEvent is complex
	sender,

	preventDefault: () => WarnLog("IPC event preventDefault() called on shim"),

	// Add if IpcRendererEvent has it
	// defaultPrevented: false,
});

function reviveProfileUrisRecursively(data: any): any {
	if (!data || typeof data !== "object") {
		return data;
	}

	if (Array.isArray(data)) {
		return data.map(reviveProfileUrisRecursively);
	}

	// Check for VSCode's $mid property or URI-like structure
	if (
		data.$mid === 1 ||
		data.$mid === 11 ||
		(typeof data.scheme === "string" &&
			(typeof data.path === "string" ||
				typeof data.authority === "string"))
	) {
		return URI.revive(data as UriComponents);
	}

	const result: any = {};

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			const value = data[key];

			// Heuristic for properties that are likely URIs or contain URIs
			if (
				(key.endsWith("Uri") ||
					key.endsWith("Resource") ||
					key.endsWith("Home") ||
					key === "location" ||
					key === "resource" ||
					key === "home" ||
					key === "uri") &&
				value
			) {
				if (value instanceof URI) {
					result[key] = value;
				} else if (
					typeof value === "object" &&
					value !== null &&
					typeof value.scheme === "string"
				) {
					result[key] = URI.revive(value as UriComponents);
				} else if (typeof value === "string") {
					try {
						if (
							value.includes(":") ||
							value.startsWith("/") ||
							value.startsWith("\\\\") ||
							/^[a-zA-Z]:\\/.test(value)
						) {
							result[key] = URI.parse(value);
						} else {
							result[key] = value;
						}
					} catch {
						result[key] = value;
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
		const currentProcessInfo: any = await mockTauriApi.getCurrentProcess();

		const platform: string = await mockTauriApi.tauriOsPlatform();

		const arch: string = await mockTauriApi.tauriOsArch();

		const osTypeValueImpl: string = await mockTauriApi.tauriOsType();

		const osRelease: string = await mockTauriApi.tauriOsVersion();

		const appNameFromApi: string =
			await mockTauriApi.getTauriAppNameFromApi();

		const appVersionFromApi: string =
			await mockTauriApi.getTauriAppVersionFromApi();

		const tauriAppExeDir: string = await mockTauriApi.executableDir();

		// Used for appRoot
		// const tauriResDir: string = await mockTauriApi.resourceDir();

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

			const settingsJson = metaElement?.dataset?.["settings"];

			try {
				const parsedSettings = settingsJson
					? JSON.parse(settingsJson)
					: {};

				return reviveProfileUrisRecursively(parsedSettings) as Partial<
					INativeWindowConfiguration & ICustomWorkbenchConfiguration
				>;
			} catch (e) {
				ErrorLog("Failed to parse workbench options:", e);

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
						: "linux",

			arch: arch,

			type: "renderer",

			versions: {
				node: currentProcessInfo.versions?.node || "18.0.0",

				chrome:
					navigator.userAgent.match(/Chrome\/([0-9.]+)/)?.[1] ||
					"100.0.0.0",

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

			on: (_ev, _cb) => sandboxNodeProcessShim,

			cwd: () =>
				(sandboxNodeProcessShim.env as TauriProcessEnv)["VSCODE_CWD"]!,

			getProcessMemoryInfo: async (): Promise<VsProcessMemoryInfo> => ({
				private: 0,

				residentSet: 0,

				shared: 0,
			}),

			shellEnv: async (): Promise<ILocalProcessEnvironment> =>
				({ ...sandboxNodeProcessShim.env }) as ILocalProcessEnvironment,
		};

		const ipcRendererShimImpl: IpcRenderer = {
			send: (channel, ...args) => {
				if (channel.startsWith("vscode:"))
					tauriEmit(
						channel,

						args.length === 1 && args[0] !== undefined
							? args[0]
							: args,
					).catch(ErrorLog);
				else
					WarnLog(
						`Denying IPC send on non-vscode channel: ${channel}`,
					);
			},

			invoke: async (channel, ...args) => {
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
						`IPC Invoke: Unhandled vscode channel '${channel}'. Argument:`,

						args,
					);

					try {
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

				listener: (event: IpcRendererEvent, ...args: any[]) => void,
			): IpcRenderer => {
				// Matched IpcRendererEvent
				if (channel.startsWith("vscode:")) {
					tauriListen(channel, (event: TauriEvent<any>) =>
						listener(
							createMockIpcEvent(
								ipcRendererShimImpl,
							) as IpcRendererEvent,

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

				listener: (event: IpcRendererEvent, ...args: any[]) => void,
			): IpcRenderer => {
				// Matched IpcRendererEvent
				if (channel.startsWith("vscode:")) {
					tauriOnce(channel, (event: TauriEvent<any>) =>
						listener(
							createMockIpcEvent(
								ipcRendererShimImpl,
							) as IpcRendererEvent,

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
		};

		const webFrameShimImpl: WebFrame = {
			setZoomLevel: async (_l) => Log(`webFrame.setZoomLevel(${_l})`),
		};

		const sandboxContextImpl = (() => {
			let _resolvedConfiguration: ISandboxConfiguration | undefined =
				undefined;

			const configPromise = (async (): Promise<ISandboxConfiguration> => {
				if (_resolvedConfiguration) return _resolvedConfiguration;

				Log("context.resolveConfiguration: Resolving...");

				const tauriHome = await mockTauriApi.homeDir();

				const tauriAppData = await mockTauriApi.appDataDir();

				// Was tauriLogsPath, made consistent.
				// const tauriLogsDir = await mockTauriApi.appLogDir();

				const defaultProfileLocation = URI.file(
					await mockTauriApi.tauriJoin(
						tauriAppData,

						"User",

						"profiles",

						"defaultProfile",
					),
				);

				const commonProfilePropsFactory = async (
					loc: URI,
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
							loc.fsPath,

							"globalStorage",
						),
					),

					settingsResource: URI.file(
						await mockTauriApi.tauriJoin(
							loc.fsPath,

							"settings.json",
						),
					),

					keybindingsResource: URI.file(
						await mockTauriApi.tauriJoin(
							loc.fsPath,

							"keybindings.json",
						),
					),

					tasksResource: URI.file(
						await mockTauriApi.tauriJoin(loc.fsPath, "tasks.json"),
					),

					snippetsHome: URI.file(
						await mockTauriApi.tauriJoin(loc.fsPath, "snippets"),
					),

					extensionsResource: URI.file(
						await mockTauriApi.tauriJoin(
							loc.fsPath,

							"extensions.json",
						),
					),

					promptsHome: URI.file(
						await mockTauriApi.tauriJoin(loc.fsPath, "prompts"),
					),

					cacheHome: URI.file(
						await mockTauriApi.tauriJoin(loc.fsPath, "cache"),
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

				// Creates an object that is compatible with UriDto<T> where T is IUserDataProfile
				// by making sure all URI fields in IUserDataProfile become UriComponents.
				const profileToUriDto = (
					profile: IUserDataProfile,
				): UriDto<IUserDataProfile> => {
					// VSCode DTO marker
					const dto: any = { $mid: 11 };

					for (const key in profile) {
						const propKey = key as keyof IUserDataProfile;

						const value = profile[propKey];

						if (value instanceof URI) {
							// Convert URI to UriComponents
							dto[propKey] = value.toJSON();
						} else if (
							Array.isArray(value) &&
							value.every((item) => item instanceof URI)
						) {
							dto[propKey] = value.map((uri) =>
								(uri as URI).toJSON(),
							);
						} else {
							dto[propKey] = value;
						}
					}

					return dto as UriDto<IUserDataProfile>;
				};

				const defaultProfilesValue = {
					home: URI.file(
						await mockTauriApi.tauriJoin(
							tauriAppData,

							"User",

							"profiles",
						),
					),

					all: [
						profileToUriDto(defaultUserDataProfile),
					] as ReadonlyArray<UriDto<IUserDataProfile>>,

					profile: profileToUriDto(defaultUserDataProfile),
				};

				// Creates an object compatible with UriDto<ILoggerResource>
				const loggerToUriDto = (
					loggerData: ILoggerResource,
				): UriDto<ILoggerResource> => {
					const dto: any = { $mid: 11 };

					for (const key in loggerData) {
						const propKey = key as keyof ILoggerResource;

						const value = loggerData[propKey];

						if (value instanceof URI) {
							dto[propKey] = value.toJSON();
						} else {
							dto[propKey] = value;
						}
					}

					// The UriDto's components should refer to the logger's primary resource (log file URI)
					// This often means spreading the components of loggerData.resource
					const resourceComponents = loggerData.resource.toJSON();

					for (const compKey in resourceComponents) {
						if (!(compKey in dto)) {
							// Avoid overwriting id, name etc. if they match component keys
							dto[compKey] = (resourceComponents as any)[compKey];
						}
					}

					return dto as UriDto<ILoggerResource>;
				};

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

					const loggerData: ILoggerResource = {
						id: l.id || "default",

						name: l.name || "Default Logger",

						resource: resourceUri,

						logLevel: l.logLevel as LogLevel,

						hidden: typeof l.hidden === "boolean" ? l.hidden : true,

						when: typeof l.when === "string" ? l.when : "",
					};

					return loggerToUriDto(loggerData);
				});

				let workspaceToSet:
					| IWorkspaceIdentifier
					| ISingleFolderWorkspaceIdentifier
					| undefined = undefined;

				if (initialConfigFromMeta.workspace) {
					const revived = reviveIdentifier(
						initialConfigFromMeta.workspace,
					);

					if (
						revived &&
						"id" in revived &&
						!("configPath" in revived || "uri" in revived) &&
						!("transient" in revived)
					) {
						workspaceToSet = undefined;
					} else {
						workspaceToSet = revived as
							| IWorkspaceIdentifier
							| ISingleFolderWorkspaceIdentifier
							| undefined;
					}
				}

				const mapUriComponentsArrayToStringArray = (
					arr?: UriComponents[] | string[],
				): string[] | undefined => {
					if (!arr) return undefined;

					// TS2352: If 'item' is UriDto, it's not directly UriComponents for URI.revive.
					// Assuming data from meta is string[] or already revived UriComponents[].
					return arr.map((item) =>
						typeof item === "string"
							? item
							: URI.revive(item).toString(),
					);
				};

				const nativeConfig: INativeWindowConfiguration = {
					appRoot: "/Static/Application/",

					nls: {
						language: "en",

						messages: [],
					},

					product: {
						applicationName: "",

						dataFolderName: "",

						extensionProperties: {},

						nameLong: "",

						nameShort: "",

						serverApplicationName: "",

						urlProtocol: "",

						version: "",
					},

					userEnv: {},

					// NativeParsedArgument fields:
					// "folder-uri": mapUriDtoArrayToStringArray(
					// 	initialConfigFromMeta["folder-uri"],
					// ),

					"file-uri": mapUriComponentsArrayToStringArray(
						initialConfigFromMeta["file-uri"] as
							| UriComponents[]
							| string[]
							| undefined,
					),

					// "workspace-uri": mapUriComponentsArrayToStringArray(
					// 	initialConfigFromMeta[
					// 		"workspace-uri" as keyof ICustomWorkbenchConfiguration
					// 	] as UriComponents[] | string[] | undefined,
					// ),

					_: initialConfigFromMeta._ || [],

					// Default to false if undefined
					diff: initialConfigFromMeta.diff ?? false,

					merge: initialConfigFromMeta.merge ?? false,

					add: initialConfigFromMeta.add ?? false,

					goto: initialConfigFromMeta.goto ?? false,

					// ISandboxConfiguration (which INativeWindowConfiguration extends)
					windowId:
						initialConfigFromMeta.windowId ??
						Number(Window.getCurrent().label) ??
						String(Date.now()),

					// parentPid:
					// 	initialConfigFromMeta.parentPid ||
					// 	currentProcessInfo.pid ||
					// 	// Added parentPid
					// 	0,

					// INativeWindowConfiguration specific fields:
					mainPid: currentProcessInfo.pid || 0,

					machineId: (await mockTauriApi
						.invoke("get_machine_id")
						.catch(() => "tauri-mc-id")) as string,

					sqmId: (await mockTauriApi
						.invoke("get_sqm_id")
						.catch(() => "tauri-sqm-id")) as string,

					devDeviceId: (await mockTauriApi
						.invoke("get_dev_device_id")
						.catch(() => "tauri-dev-id")) as string,

					execPath: sandboxNodeProcessShim.execPath,

					backupPath:
						initialConfigFromMeta.backupPath ||
						(await mockTauriApi.tauriJoin(tauriAppData, "Backups")),

					profiles: defaultProfilesValue,

					homeDir:
						typeof initialConfigFromMeta.homeDir === "string"
							? initialConfigFromMeta.homeDir
							: initialConfigFromMeta.homeDir &&
								  typeof initialConfigFromMeta.homeDir ===
										"object" &&
								  "fsPath" in initialConfigFromMeta.homeDir
								? (initialConfigFromMeta.homeDir as URI).fsPath
								: tauriHome,

					tmpDir:
						typeof initialConfigFromMeta.tmpDir === "string"
							? initialConfigFromMeta.tmpDir
							: initialConfigFromMeta.tmpDir &&
								  typeof initialConfigFromMeta.tmpDir ===
										"object" &&
								  "fsPath" in initialConfigFromMeta.tmpDir
								? (initialConfigFromMeta.tmpDir as URI).fsPath
								: osTypeValueImpl === "Windows_NT"
									? ((await mockTauriApi
											.invoke("get_env", { name: "TEMP" })
											.catch(() => "C:\\Temp")) as string)
									: "/tmp",

					userDataDir:
						typeof initialConfigFromMeta.userDataDir === "string"
							? initialConfigFromMeta.userDataDir
							: initialConfigFromMeta.userDataDir &&
								  typeof initialConfigFromMeta.userDataDir ===
										"object" &&
								  "fsPath" in initialConfigFromMeta.userDataDir
								? (initialConfigFromMeta.userDataDir as URI)
										.fsPath
								: tauriAppData,

					partsSplash: initialConfigFromMeta.partsSplash
						? ({
								// Properties from IPartsSplash in themeService.ts
								zoomLevel:
									initialConfigFromMeta.partsSplash
										.zoomLevel === undefined
										? undefined
										: Number(
												initialConfigFromMeta
													.partsSplash.zoomLevel,
											),

								baseTheme: (initialConfigFromMeta.partsSplash
									.baseTheme ||
									"vs-dark") as VsCodeThemeTypeSelector,

								colorInfo: initialConfigFromMeta.partsSplash
									.colorInfo || {
									background: "#1e1e1e",

									foreground: "#d4d4d4",

									editorBackground: "#1e1e1e",

									titleBarBackground: "#3c3c3c",

									titleBarBorder: undefined,

									activityBarBackground: "#333333",

									activityBarBorder: undefined,

									sideBarBackground: "#252526",

									sideBarBorder: undefined,

									statusBarBackground: "#007acc",

									statusBarBorder: undefined,

									statusBarNoFolderBackground: "#68217a",

									windowBorder: undefined,
								},

								layoutInfo:
									initialConfigFromMeta.partsSplash
										.layoutInfo || undefined,
							} as IPartsSplash)
						: undefined,

					workspace: workspaceToSet,

					logLevel:
						(initialConfigFromMeta.logLevel as LogLevel) ||
						// Use LogLevel.Info as value
						LogLevel.Info,

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

					accessibilitySupport:
						initialConfigFromMeta.accessibilitySupportOverride ===
						"on"
							? true
							: initialConfigFromMeta.accessibilitySupportOverride ===
								  "off"
								? false
								: // Corrected boolean conversion
									undefined,

					isCustomZoomLevel:
						initialConfigFromMeta.isCustomZoomLevel ??
						(initialConfigFromMeta.zoomLevel !== undefined &&
							initialConfigFromMeta.zoomLevel !== 0),

					perfMarks: initialConfigFromMeta.perfMarks || [],

					os: {
						arch,

						hostname: "tauri.localhost",

						release: osRelease,
					} as IOSConfiguration,

					fullscreen: initialConfigFromMeta.fullscreen ?? false,

					maximized: initialConfigFromMeta.maximized ?? false,

					isInitialStartup:
						initialConfigFromMeta.isInitialStartup ?? true,

					policiesData: initialConfigFromMeta.policiesData || {},
				};

				_resolvedConfiguration = nativeConfig as ISandboxConfiguration;

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
			acquire: (_r, _n) => WarnLog("ipcMessagePort.acquire not impl"),
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
		const errorMessage =
			error instanceof Error ? error.message : String(error);

		ErrorLog("Fatal error in preload:", errorMessage, error.stack || error);

		const errDiv = document.createElement("div");

		errDiv.textContent = `Preload Error: ${errorMessage}. Check console.`;

		errDiv.style.cssText =
			"color:red;padding:20px;font-family:sans-serif;white-space:pre-wrap;z-index:9999;position:fixed;top:0;left:0;width:100%;background:pink;";

		if (document.body) {
			document.body.prepend(errDiv);
		} else {
			window.addEventListener("DOMContentLoaded", () =>
				document.body.prepend(errDiv),
			);
		}
	}
})();

export {};
