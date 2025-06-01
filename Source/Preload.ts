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
// For TS2307 errors regarding @tauri-apps/api modules:
// 1. Ensure "@tauri-apps/api" is in "dependencies" in package.json.
// 2. Check tsconfig.json: "moduleResolution" ("node", "nodenext", or "bundler").
//    Ensure "types" or "typeRoots" are not misconfigured to exclude node_modules/@tauri-apps.
// 3. Delete node_modules and package-lock.json/yarn.lock/pnpm-lock.yaml and reinstall.
// 4. If using pnpm, ensure shared-workspace-lockfile=false if issues persist across monorepo packages.
import {
	arch as tauriOsArch,
	platform as tauriOsPlatform,
	// Renamed to avoid conflict, this is `os.type()`
	type as tauriOsType,
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
	getCurrent as getCurrentProcess,
	type ProcessInfo,
} from "@tauri-apps/api/process";
import { Window } from "@tauri-apps/api/window";
// --- VSCode Type Imports (for type checking and clarity) ---
import { URI, type UriComponents } from "vs/base/common/uri";
import type { ISandboxConfiguration } from "vs/base/parts/sandbox/common/sandboxTypes";
import type {
	// Ensure this type definition from VSCode includes `removeAllListeners`
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
import type { ThemeTypeSelector } from "vs/platform/theme/common/theme";
import type { IPartsSplash as VsCodeIPartsSplashOriginal } from "vs/platform/theme/common/themeService";
import type { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
// For IPartsSplash, if VSCode doesn't export it:
// TS2459: Module '"vs/platform/window/common/window"' declares 'IPartsSplash' locally, but it is not exported.
// This confirms VSCode has it but doesn't export. Your local definition is the way.
import type {
	IColorScheme,
	INativeWindowConfiguration,
	IOSConfiguration,
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

// This DTO is for data transfer, often what JSON.parse yields before URI.revive
interface ILocalUriDto<T = any> {
	// Marker for VSCode's URI revival logic
	$mid: 11;

	scheme: string;

	authority?: string;

	path?: string;

	query?: string;

	fragment?: string;

	// Often used for original non-file URIs
	external?: string;

	_formatted?: string | null;

	_fsPath?: string | null;

	// For UriDto<T>
	payload?: T;
}

interface ILocalLoggerResource {
	resource: URI;

	logLevel?: number;

	id: string;

	name: string;

	hidden?: boolean;

	when?: string;
}

interface ILocalPartsSplash
	extends Omit<VsCodeIPartsSplashOriginal, "baseTheme"> {
	zoomLevel: number;

	// Corrected type
	baseTheme: ThemeTypeSelector;

	// Ensure colorInfo and layoutInfo are compatible or explicitly defined
	colorInfo: VsCodeIPartsSplashOriginal["colorInfo"];

	layoutInfo: VsCodeIPartsSplashOriginal["layoutInfo"];
}

// Configuration properties from the meta tag
interface ICustomWorkbenchConfiguration {
	availableLanguages?: Record<string, string>;

	pseudo?: boolean;

	defaultProfile?: IUserDataProfile | ILocalUriDto<IUserDataProfile>;

	productConfiguration?: Partial<typeof product>;

	loggers?: Array<
		Partial<ILocalLoggerResource> & { resource: URI | ILocalUriDto }
	>;

	// Allow general string for initial parsing
	accessibilitySupport?: "on" | "off" | "auto" | string;

	// If this is a custom property you expect
	workspaceUri?: URI | ILocalUriDto;
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
	// Explicitly defined
	VSCODE_CWD: string;

	VSCODE_NLS_CONFIG: string;

	VSCODE_DEV?: "1";
}

function reviveUriDto<T>(dto: ILocalUriDto<T>): URI {
	// A helper to ensure we're creating a URI from a DTO-like object for revival
	const uriComponents: UriComponents = {
		scheme: dto.scheme,

		authority: dto.authority,

		path: dto.path,

		query: dto.query,

		fragment: dto.fragment,
	};

	// If URI.revive can take an ILocalUriDto directly, this helper might be simplified.
	// The key is that URI.revive needs an object that looks like a serialized URI.
	return URI.revive(uriComponents);
}

function reviveProfileUrisRecursively(data: any): any {
	if (!data || typeof data !== "object") {
		return data;
	}

	if (Array.isArray(data)) {
		return data.map(reviveProfileUrisRecursively);
	}

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
		// If it has $mid: 11, it's likely an ILocalUriDto or similar structure.
		// URI.revive can handle objects that look like UriComponents.
		if (data.$mid === 11) {
			// Explicitly cast to UriComponents if ILocalUriDto is compatible
			return URI.revive(data as UriComponents);
		}

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
					// Value is already URI-like
					result[key] = URI.revive(value);
				} else if (typeof value === "string") {
					try {
						if (
							value.includes(":") ||
							value.startsWith("/") ||
							value.startsWith("\\\\")
						) {
							result[key] = URI.parse(value);
						} else {
							// Not a URI string, keep as is or recurse if object
							result[key] = value;
						}
					} catch {
						// Parsing failed
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
		const currentProcessInfo: ProcessInfo = await getCurrentProcess();

		const platform: string = await tauriOsPlatform();

		const arch: string = await tauriOsArch();

		const osTypeValueImpl: string = await tauriOsType();

		const osRelease: string = await tauriOsVersion();

		const appNameFromApi: string = await getTauriAppNameFromApi();

		const appVersionFromApi: string = await getTauriAppVersionFromApi();

		const tauriAppExeDir: string = await executableDir();

		const tauriResDir: string = await resourceDir();

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

		const vscodeCwd = await tauriResolve(".");

		const sandboxNodeProcessShim: ISandboxNodeProcess = {
			platform: platform,

			arch: arch,

			type: "renderer",

			versions: {
				node: currentProcessInfo.versions?.node || "N/A (Tauri Shim)",

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

			env: {
				...(currentProcessInfo.env as ILocalProcessEnvironment),

				VSCODE_DEV: isDebugMode ? "1" : undefined,

				// Explicitly defined on TauriProcessEnv
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

				// Cast ensures VSCODE_CWD and others are seen by TS
			} as TauriProcessEnv,

			execPath:
				currentProcessInfo.execPath ||
				(await tauriJoin(tauriAppExeDir, appNameFromApi)),

			on: (eventType: string, _callback: Function) => {
				// _callback used to satisfy signature
				WarnLog(
					`Shim: process.on('${eventType}') called. Event not truly handled by Tauri.`,
				);

				return sandboxNodeProcessShim;
			},

			// TS4111: Access VSCODE_CWD via bracket if type is too generic, but TauriProcessEnv has it explicitly
			cwd: () =>
				(sandboxNodeProcessShim.env as TauriProcessEnv)["VSCODE_CWD"]!,

			getProcessMemoryInfo: async (): Promise<ProcessMemoryInfo> => {
				WarnLog(
					"Shim: process.getProcessMemoryInfo() returning placeholder data.",
				);

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
				// ... (implementation as before, ensure robust error handling or default returns)
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
						`Unhandled ipcRenderer.invoke on: ${channel}. Args:`,

						args,
					);

					// Or throw specific error if VSCode expects it
					return undefined;
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
						listener(
							{ sender: ipcRendererShimImpl },

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

				_listener: (...args: any[]) => void,
			): IpcRenderer => {
				// _listener
				WarnLog(
					`Shim: ipcRenderer.removeListener for '${channel}' is not fully implemented.`,
				);

				return ipcRendererShimImpl;
			},

			// TS2561: Add removeAllListeners if it's part of VSCode's IpcRenderer type definition
			// If your imported `electronTypes.IpcRenderer` includes it, this shim must too.
			removeAllListeners: (channel: string): IpcRenderer => {
				WarnLog(
					`Shim: ipcRenderer.removeAllListeners for '${channel}' is not implemented.`,
				);

				return ipcRendererShimImpl;
			},
		};

		const webFrameShimImpl: WebFrame = {
			// ... (as before)
			setZoomLevel: async (level: number) => {
				Log(
					`Shim: webFrame.setZoomLevel(${level}) called. Actual zoom needs Tauri window integration.`,
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

					useDefaultFlags: {},

					isTransient: false,
				};

				// For TS2352/TS2769: When creating DTOs, construct plain objects.
				// URI.revive takes UriComponents or objects with $mid.
				// Don't add $mid to a URI instance. Convert URI instance to UriComponents first.
				const profileToDto = (
					profile: IUserDataProfile,
				): ILocalUriDto<IUserDataProfile> => {
					const dtoPayload = { ...profile };

					// Nullify or convert URI instances in payload to prevent deep revival issues if not careful
					// For simplicity, let's assume payload can handle raw profile data for now,

					// but be mindful if profile itself contains many URI instances.
					return {
						$mid: 11,

						// Use a primary URI like location for DTO parts
						scheme: profile.location.scheme,

						path: profile.location.path,

						authority: profile.location.authority,

						// If payload needs to be the full profile
						// payload: dtoPayload,

						// For simplicity, assume URI.revive(dto) will construct the URI,

						// and VSCode later re-fetches/re-builds the full profile from this revived URI.
						// If the payload *is* the full profile, ensure it's serializable and reviveable.
						// Spread components of the location URI
						...profile.location.toJSON(),

						// This means the revived URI will have the full profile in its payload.
						payload: profile,
					};
				};

				const defaultProfilesValue = {
					home: URI.file(
						await tauriJoin(tauriAppData, "User", "profiles"),
					),

					// Store DTO
					all: [profileToDto(defaultUserDataProfile)],

					profile: defaultUserDataProfile,
				};

				const revivedLoggers: ILocalLoggerResource[] = (
					initialConfigFromMeta.loggers || []
				).map(
					(l: any): ILocalLoggerResource => ({
						id: l.id || "default",

						name: l.name || "Default Logger",

						resource:
							l.resource instanceof URI
								? l.resource
								: reviveUriDto(
										l.resource || {
											scheme: "file",

											path: "/tmp/default.log",

											$mid: 11,
										},
									),

						logLevel:
							typeof l.logLevel === "number"
								? l.logLevel
								: undefined,

						hidden:
							typeof l.hidden === "boolean"
								? l.hidden
								: undefined,

						when: typeof l.when === "string" ? l.when : undefined,
					}),
				);

				let workspaceValueToSet:
					| IWorkspaceIdentifier
					| ISingleFolderWorkspaceIdentifier
					| IEmptyWorkspaceIdentifier
					| undefined;

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
						// Heuristic for IEmptyWorkspaceIdentifier
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

				const determinedWorkspaceUri =
					workspaceValueToSet && "configPath" in workspaceValueToSet
						? workspaceValueToSet.configPath
						: workspaceValueToSet && "uri" in workspaceValueToSet
							? workspaceValueToSet.uri
							: undefined;

				const nativeConfig: INativeWindowConfiguration = {
					...(initialConfigFromMeta as INativeWindowConfiguration),

					windowId:
						initialConfigFromMeta.windowId ??
						Window.getCurrent().label ??
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
						(await tauriResolve(tauriResDir, ".")),

					logsPath:
						initialConfigFromMeta.logsPath || URI.file(tauriLogs),

					userEnv: {
						...sandboxNodeProcessShim.env,

						...((initialConfigFromMeta.userEnv as ILocalProcessEnvironment) ||
							{}),
					} as ILocalProcessEnvironment,

					os: {
						arch,

						hostname: "tauri.localhost",

						release: osRelease,

						platform,

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
							).matches,
						} as IColorScheme),

					// TS2322: Ensure paths are strings
					homeDir: initialConfigFromMeta.homeDir
						? initialConfigFromMeta.homeDir instanceof URI
							? initialConfigFromMeta.homeDir.fsPath
							: (initialConfigFromMeta.homeDir as string)
						: tauriHome,

					tmpDir: initialConfigFromMeta.tmpDir
						? initialConfigFromMeta.tmpDir instanceof URI
							? initialConfigFromMeta.tmpDir.fsPath
							: (initialConfigFromMeta.tmpDir as string)
						: osTypeValueImpl === "windows"
							? (await invoke<string | null>("get_env", {
									name: "TEMP",
								}).catch(() => "C:\\Temp")) || "C:\\Temp"
							: "/tmp",

					userDataDir: initialConfigFromMeta.userDataDir
						? initialConfigFromMeta.userDataDir instanceof URI
							? initialConfigFromMeta.userDataDir.fsPath
							: (initialConfigFromMeta.userDataDir as string)
						: tauriAppData,

					workspace: workspaceValueToSet as
						| IWorkspaceIdentifier
						| ISingleFolderWorkspaceIdentifier
						// Use processed value, ensure compatible with target
						| undefined,

					// TS2551: If 'workspaceUri' is not on INativeWindowConfiguration, don't set it directly.
					// VSCode should derive the primary URI from the 'workspace' object.
					// If you have it in ICustomWorkbenchConfiguration and need to pass it:
					// ...(initialConfigFromMeta.workspaceUri ? { workspaceUri: initialConfigFromMeta.workspaceUri instanceof URI ? initialConfigFromMeta.workspaceUri : reviveUriDto(initialConfigFromMeta.workspaceUri) } : {}),

					// For now, assume it's derived from `workspace`. If `initialConfigFromMeta.workspaceUri` is used, it must be handled.
					// The error occurs if `nativeConfig.workspaceUri = ...` is attempted and `workspaceUri` is not a key.
					// So, if `initialConfigFromMeta.workspaceUri` exists and IS USED, then INativeWindowConfiguration needs to be extended or it's a custom field.
					// For this pass, I'm removing direct assignment of workspaceUri to nativeConfig, assuming it's obtained from `nativeConfig.workspace`.
					// If `INativeWindowConfiguration` *does* have `workspaceUri?: URI`, then:
					// workspaceUri: initialConfigFromMeta.workspaceUri ? (initialConfigFromMeta.workspaceUri instanceof URI ? initialConfigFromMeta.workspaceUri : reviveUriDto(initialConfigFromMeta.workspaceUri)) : determinedWorkspaceUri,

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

					// TS2322: zoomLevel string to number
					zoomLevel:
						typeof initialConfigFromMeta.zoomLevel === "number"
							? initialConfigFromMeta.zoomLevel
							: Number(initialConfigFromMeta.zoomLevel || 0),

					isCustomZoomLevel:
						initialConfigFromMeta.isCustomZoomLevel ??
						(initialConfigFromMeta.zoomLevel !== undefined &&
							initialConfigFromMeta.zoomLevel !== 0),

					productConfiguration: {
						...product,

						...(initialConfigFromMeta.productConfiguration || {}),
					},

					// TS2322 / TS2367 accessibilitySupport: ensure string input if comparing to strings
					accessibilitySupport:
						typeof initialConfigFromMeta.accessibilitySupport ===
							"string" &&
						(initialConfigFromMeta.accessibilitySupport === "on" ||
							initialConfigFromMeta.accessibilitySupport ===
								"off" ||
							initialConfigFromMeta.accessibilitySupport ===
								"auto")
							? initialConfigFromMeta.accessibilitySupport
							: "auto",

					perfMarks: initialConfigFromMeta.perfMarks || [],

					policiesData: initialConfigFromMeta.policiesData || {},

					// TS2322 partsSplash.baseTheme: Use ThemeTypeSelector
					partsSplash: initialConfigFromMeta.partsSplash
						? ({
								zoomLevel:
									typeof initialConfigFromMeta.partsSplash
										.zoomLevel === "number"
										? initialConfigFromMeta.partsSplash
												.zoomLevel
										: 0,

								baseTheme:
									initialConfigFromMeta.partsSplash
										.baseTheme || "vs-dark",

								colorInfo:
									initialConfigFromMeta.partsSplash
										.colorInfo || {},

								layoutInfo:
									initialConfigFromMeta.partsSplash
										.layoutInfo || {},

								...(initialConfigFromMeta.partsSplash as Partial<VsCodeIPartsSplashOriginal>),
							} as ILocalPartsSplash)
						: ({
								zoomLevel: 0,

								baseTheme: "vs-dark",

								colorInfo: {},

								layoutInfo: {},
							} as ILocalPartsSplash),
				};

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
			// ... (as before)
			getPathForFile: (file: File): string => {
				WarnLog(
					`Shim: webUtils.getPathForFile(${file.name}). Path property might not be available.`,
				);

				return (file as any).path || file.name;
			},
		};

		const ipcMessagePortShimImpl: IpcMessagePort = {
			// ... (as before)
			acquire: (responseChannel: string, nonce: string): void => {
				WarnLog(
					`Shim: ipcMessagePort.acquire('${responseChannel}', '${nonce}') called. Not implemented.`,
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

		Log("window.vscode shims attached successfully.");
	} catch (error) {
		ErrorLog("Fatal error during preload script execution:", error);

		const errDiv = document.createElement("div");

		errDiv.textContent = `Tauri Preload Error: ${error instanceof Error ? error.message : String(error)}. Check console.`;

		errDiv.style.cssText =
			"position:fixed;top:0;left:0;width:100%;padding:20px;background-color:red;color:white;font-family:sans-serif;font-size:16px;z-index:9999;white-space:pre-wrap;text-align:center;";

		if (document.body) document.body.prepend(errDiv);
		else
			window.addEventListener("DOMContentLoaded", () =>
				document.body.prepend(errDiv),
			);
	}
})();

export {};
