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
	IpcRenderer,
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
import product from "vs/platform/product/common/product.js";
import { ThemeTypeSelector as VsCodeThemeTypeSelector } from "vs/platform/theme/common/theme";
import { IPartsSplash } from "vs/platform/theme/common/themeService";
import type { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
import type {
	IColorScheme,
	// Primary config interface from VSCode
	INativeWindowConfiguration,
	IOSConfiguration,
} from "vs/platform/window/common/window";
import {
	reviveIdentifier,
	type ISingleFolderWorkspaceIdentifier,
	type IWorkspaceIdentifier,
} from "vs/platform/workspace/common/workspace.js";

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
		// Use 'any' for ProcessInfo mock flexibility
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

// Configuration properties from the meta tag
interface ICustomWorkbenchConfiguration {
	availableLanguages?: Record<string, string>;

	pseudo?: boolean;

	defaultProfile?: IUserDataProfile | UriDto<IUserDataProfile>;

	productConfiguration?: Partial<typeof product>;

	loggers?: Array<
		Partial<ILoggerResource> & { resource: URI | UriDto<ILoggerResource> }
	>;

	// For converting to INativeWindowConfiguration.accessibilitySupport
	accessibilitySupportOverride?: "on" | "off" | "auto" | string;

	// From NativeParsedArgs can be string[]
	"folder-uri"?: string[] | UriDto<any>[];

	// From NativeParsedArgs can be string[]
	"file-uri"?: string[] | UriDto<any>[];

	// From NativeParsedArgs can be string[]
	"workspace-uri"?: string[] | UriDto<any>[];

	// Add other NativeParsedArgs fields if they come from meta tag
	_?: string[];

	diff?: boolean;

	merge?: boolean;

	add?: boolean;

	goto?: boolean;

	// From ISandboxConfiguration, not INativeWindowConfiguration
	parentPid?: number;
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

function reviveProfileUrisRecursively(data: any): any {
	if (!data || typeof data !== "object") {
		return data;
	}

	if (Array.isArray(data)) {
		return data.map(reviveProfileUrisRecursively);
	}

	const GUEST_SCHEME_AUTHORITY_REGEXP =
		/^vscode-remote-guest:(\/\/([^\\/?#]*))?/;

	if (
		(typeof data.scheme === "string" &&
			(data.scheme === "file" ||
				data.scheme === "vscode-userdata" ||
				GUEST_SCHEME_AUTHORITY_REGEXP.test(data.scheme))) ||
		data.$mid === 1 ||
		data.$mid === 11
	) {
		return URI.revive(data as UriComponents);
	}

	const result: any = {};

	for (const key in data) {
		if (Object.prototype.hasOwnProperty.call(data, key)) {
			const value = data[key];

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
		// Using mock
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

		// TS6133: unused
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

						args.length === 1 ? args[0] : args,
					).catch(ErrorLog);
			},

			invoke: async (channel, ...args) => {
				if (channel === "vscode:fetchShellEnv")
					return {
						...sandboxNodeProcessShim.env,

						FROM_TAURI_SHELL_ENV_SHIM: "true",
					};

				if (channel.startsWith("vscode:")) {
					WarnLog("Invoke unhandled:", channel, args);

					return undefined;
				}

				throw new Error("invoke denied");
			},

			on: (ch, l) => {
				if (ch.startsWith("vscode:"))
					tauriListen(ch, (e: TauriEvent<any>) =>
						l({ sender: ipcRendererShimImpl }, e.payload),
					).catch(ErrorLog);

				return ipcRendererShimImpl;
			},

			once: (ch, l) => {
				if (ch.startsWith("vscode:"))
					tauriOnce(ch, (e: TauriEvent<any>) =>
						l({ sender: ipcRendererShimImpl }, e.payload),
					).catch(ErrorLog);

				return ipcRendererShimImpl;
			},

			removeListener: (ch, _l) => {
				WarnLog("removeListener not impl", ch);

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

				// TS6133: tauriLogsPath -> tauriLogsDir
				const tauriLogsDir = await mockTauriApi.appLogDir();

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

					useDefaultFlags: {},

					isTransient: false,
				};

				const profileToUriDto = (
					profile: IUserDataProfile,
				): UriDto<IUserDataProfile> => {
					// TS2353: UriDto<T> is UriComponents & { T?: T; }. No 'payload'.
					// VSCode's INativeWindowConfiguration uses UriDto<IUserDataProfile> which implies the profile data itself
					// might be expected under the 'T' (phantom) property, or simply that the URI points to a profile whose
					// data is loaded separately. For `profiles.profile` and `profiles.all`, it's likely the DTO should contain the data.
					// If `UriDto<T>` means the T is directly on the object, it should be:
					// return { $mid: 11, ...profile.location.toJSON(), T: profile };

					// However, the type is T?: T, so it's optional. Most likely, URI.revive is used on the components
					// and the context (like profiles.profile.payload if `payload` was a thing) is handled by higher logic.
					// For now, let's assume UriDto for INativeWindowConfiguration just means the URI itself.
					// If full profile data needs to be in the DTO for revival, the `UriDto` definition needs careful handling.
					// The `reviveProfile` function from `userDataProfile.ts` shows it expects properties of IUserDataProfile on the DTO.
					// So, it's not just UriComponents. It's likely a flat object.
					const flatProfileDto: any = {
						// Build an object matching IUserDataProfile but with URIs as UriComponents
						// Common marker for VSCode DTOs
						$mid: 11,

						id: profile.id,

						isDefault: profile.isDefault,

						name: profile.name,

						icon: profile.icon,

						location: profile.location.toJSON(),

						globalStorageHome: profile.globalStorageHome.toJSON(),

						settingsResource: profile.settingsResource.toJSON(),

						keybindingsResource:
							profile.keybindingsResource.toJSON(),

						tasksResource: profile.tasksResource.toJSON(),

						snippetsHome: profile.snippetsHome.toJSON(),

						promptsHome: profile.promptsHome.toJSON(),

						extensionsResource: profile.extensionsResource.toJSON(),

						cacheHome: profile.cacheHome.toJSON(),

						useDefaultFlags: profile.useDefaultFlags,

						isTransient: profile.isTransient,

						workspaces: profile.workspaces?.map((w) => w.toJSON()),
					};

					return flatProfileDto as UriDto<IUserDataProfile>;
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
						// This is the "payload" for UriDto<ILoggerResource>
						id: l.id || "default",

						name: l.name || "Default Logger",

						resource: resourceUri,

						// Use value imported LogLevel
						logLevel: l.logLevel as LogLevel | undefined,

						hidden:
							typeof l.hidden === "boolean"
								? l.hidden
								: undefined,

						when: typeof l.when === "string" ? l.when : undefined,
					};

					// Constructing UriDto<ILoggerResource> as per VSCode's likely expectation for INativeWindowConfiguration
					// It's usually the URI components plus the actual T payload flattened or as a property.
					// Based on reviveProfile, it expects properties of T directly on the DTO.
					const loggerDto: any = {
						$mid: 11,

						// URI components of the log file
						...resourceUri.toJSON(),

						// ...and properties of ILoggerResource (the payload)
						id: loggerData.id,

						name: loggerData.name,

						// resource itself within payload is URI, not components
						// logLevel, hidden, when are direct properties of ILoggerResource
						logLevel: loggerData.logLevel,

						hidden: loggerData.hidden,

						when: loggerData.when,

						// The 'resource' property in the DTO for ILoggerResource's 'resource' field is tricky.
						// It could be another UriDto or just the URI string. Assuming URI components for now.
						// For INativeWindowConfiguration.loggers, each element is UriDto<ILoggerResource>.
						// The `resource` field *within* ILoggerResource is a URI.
						// The UriDto itself represents the logger entity, often identified by its main resource URI.
					};

					// To be very precise for UriDto<ILoggerResource>, it would be:
					// { ...uriOfTheLogFile.toJSON(), T: actualLoggerResourceObject }

					// But reviveProfile indicates a flatter structure.
					// Let's assume the $mid + UriComponents refers to the log file URI,

					// and the payload T (ILoggerResource) is somewhat flattened or referenced.
					// For simplicity, the above DTO might be what VSCode expects if it revives the full logger from this.
					// The error TS2353 for 'payload' means `UriDto<T>` does not have 'payload'.
					// If the intention is to make the DTO's components refer to the logger's primary resource
					// and embed the logger data, it's usually:
					// { ...loggerData.resource.toJSON(), ...loggerData (excluding resource if already spread) }

					// This part is highly dependent on how VSCode's INativeWindowConfiguration revival logic handles UriDto<ILoggerResource>.
					// For now, using a structure that `URI.revive(dto.payload)` might work on if `dto` itself is revived.
					// Let's assume the DTO itself is the logger data, with its 'resource' field being a URI (or components).
					return {
						$mid: 11,

						...loggerData.resource.toJSON(),

						...loggerData,
					} as UriDto<ILoggerResource>;
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

				const mapUriDtoArrayToStringArray = (
					arr?: UriDto<any>[] | string[],
				): string[] | undefined => {
					if (!arr) return undefined;

					return arr.map((item) =>
						typeof item === "string"
							? item
							: URI.revive(item as UriComponents).toString(),
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

					// NativeParsedArgs fields:
					"folder-uri": mapUriDtoArrayToStringArray(
						initialConfigFromMeta["folder-uri"],
					),

					"file-uri": mapUriDtoArrayToStringArray(
						initialConfigFromMeta["file-uri"],
					),

					// TS802/TS2551: Use string key for 'workspace-uri'
					// "workspace-uri": mapUriDtoArrayToStringArray(
					// 	initialConfigFromMeta[
					// 		"workspace-uri" as keyof ICustomWorkbenchConfiguration
					// 	] as UriDto<any>[] | string[] | undefined,

					// ),

					_: initialConfigFromMeta._ || [],

					diff: initialConfigFromMeta.diff,

					merge: initialConfigFromMeta.merge,

					add: initialConfigFromMeta.add,

					goto: initialConfigFromMeta.goto,

					// ISandboxConfiguration fields (some overlap with INativeWindowConfiguration)
					windowId:
						initialConfigFromMeta.windowId ??
						Number(Window.getCurrent().label) ??
						String(Date.now()),

					// TS2339: parentPid - add if ISandboxConfiguration needs it and INative doesn't provide
					// parentPid:
					// 	initialConfigFromMeta.parentPid ||
					// 	currentProcessInfo.pid ||
					// 	0,

					// INativeWindowConfiguration fields:
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
