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
// NOTE: For TS2307, ensure @tauri-apps/api is correctly installed and its types are discoverable.
import {
	arch as tauriOsArch,
	platform as tauriOsPlatform,
	// Renamed to avoid conflict
	type as tauriOsTypeValue,
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
	// Using ILocalUriDto
	// UriDto as VsCodeUriDto,
	// Using ILocalLoggerResource
	// ILoggerResource as VsCodeILoggerResource
} from "vs/platform/userDataProfile/common/userDataProfile";
// Attempt to import, but provide local fallback if module or type is unexported

// For IPartsSplash, if VSCode doesn't export it:
import type {
	IColorScheme,
	INativeWindowConfiguration,
	IOSConfiguration,
	IPartsSplash as VsCodeIPartsSplashOriginal,
	// This causes TS2459, so we'll use ILocalPartsSplash
	// IPartsSplash,
} from "vs/platform/window/common/window";
import {
	reviveIdentifier,
	// Added for workspace typing
	type IEmptyWorkspaceIdentifier,
	type ISingleFolderWorkspaceIdentifier,
	type IWorkspaceIdentifier,
} from "vs/platform/workspace/common/workspace.js";

// Local type declarations
interface ILocalProcessEnvironment {
	[key: string]: string | undefined;
}

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

interface ILocalLoggerResource {
	resource: URI;

	logLevel?: number;

	id: string;

	name: string;

	hidden?: boolean;

	when?: string;
}

// Define ILocalPartsSplash based on IPartsSplash if it's not exported or to ensure properties
// For TS2322, ensure ILocalPartsSplash matches IPartsSplash from INativeWindowConfiguration
interface ILocalPartsSplash extends Partial<VsCodeIPartsSplashOriginal> {
	// Making it required as per error TS2322
	zoomLevel: number;

	// If other properties are required by IPartsSplash, add them here.
	// For example:
	// baseTheme: string;

	// colorInfo: object;

	// layoutInfo: object;
}

declare const __DEV__: boolean;

// Unused
declare const __VSCODE_VERSION__: string;

declare const __TAURI_APP_VERSION__: string;

declare const __NODE_ENV__: string;

// Unused
declare const __TAURI_ENV_DEBUG__: string;

declare global {
	interface Window {
		vscode: IMainWindowSandboxGlobals /* ... other globals ... */;
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
	if (!data || typeof data !== "object") return data;

	if (Array.isArray(data)) return data.map(reviveProfileUrisRecursively);

	const GUEST_SCHEME_AUTHORITY_REGEXP =
		/^([a-zA-Z][a-zA-Z0-9+.-]*):(\/\/([^\\/?#]*))?/;

	if (
		typeof data.scheme === "string" &&
		(GUEST_SCHEME_AUTHORITY_REGEXP.test(data.scheme) ||
			typeof data.path === "string" ||
			typeof data.authority === "string" ||
			data.$mid === 1 ||
			data.$mid === 11)
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
				} else if (typeof value === "string") {
					try {
						result[key] = URI.parse(value);
					} catch {
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

		// Renamed from osTypeValue
		const osTypeValueImpl: string = await tauriOsTypeValue();

		const osRelease: string = await tauriOsVersion();

		const appNameFromApi: string = await getTauriAppNameFromApi();

		const appVersionFromApi: string = await getTauriAppVersionFromApi();

		const tauriAppExeDir: string = await executableDir();

		const tauriResDir: string = await resourceDir();

		const nodeEnvFromDefine: string =
			typeof __NODE_ENV__ !== "undefined" ? __NODE_ENV__ : "production";

		const tauriEnvDebugFromDefineImpl: string =
			typeof __TAURI_ENV_DEBUG__ !== "undefined"
				? __TAURI_ENV_DEBUG__
				: // Renamed
					"false";

		const getWorkbenchConstructionOptions =
			(): Partial<INativeWindowConfiguration> => {
				const metaElement = document.getElementById(
					"vscode-workbench-web-configuration",
				);

				const settings = metaElement?.dataset?.["settings"];

				try {
					const parsed = settings ? JSON.parse(settings) : {};

					return reviveProfileUrisRecursively(parsed);
				} catch (e) {
					ErrorLog("Failed to parse workbench options:", e);

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

			env: {
				...(currentProcessInfo.env as ILocalProcessEnvironment),

				VSCODE_DEV:
					nodeEnvFromDefine === "development" ||
					tauriEnvDebugFromDefineImpl === "true"
						? "1"
						: undefined,

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
				(await tauriJoin(tauriAppExeDir, appNameFromApi)),

			on: (evType: string, _cb: Function) =>
				WarnLog(`process.on('${evType}') shimmed.`),

			cwd: () => sandboxNodeProcessShim.env["VSCODE_CWD"]!,

			getProcessMemoryInfo: async (): Promise<ProcessMemoryInfo> => ({
				private: 0,

				residentSet: 0,

				shared: 0,
			}),

			shellEnv: async (): Promise<ILocalProcessEnvironment> =>
				({ ...sandboxNodeProcessShim.env }) as ILocalProcessEnvironment,
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
						`Unhandled ipcRenderer.invoke on: ${channel}. Args:`,

						args,
					);

					return undefined;
				}

				WarnLog(`Denying IPC invoke on non-vscode channel: ${channel}`);

				throw new Error(`Unsupported IPC invoke channel: ${channel}`);
			},

			on: (
				ch: string,

				lis: (ev: any, ...ar: any[]) => void,
			): IpcRenderer => {
				if (ch.startsWith("vscode:")) {
					tauriListen(ch, (ev: TauriEvent<any>) =>
						lis({ sender: ipcRendererShimImpl }, ev.payload),
					).catch(console.error);
				}

				return ipcRendererShimImpl;
			},

			once: (
				ch: string,

				lis: (ev: any, ...ar: any[]) => void,
			): IpcRenderer => {
				if (ch.startsWith("vscode:")) {
					tauriOnce(ch, (ev: TauriEvent<any>) =>
						lis({ sender: ipcRendererShimImpl }, ev.payload),
					).catch(console.error);
				}

				return ipcRendererShimImpl;
			},

			removeListener: (
				ch: string,

				_lis: (...ar: any[]) => void,
			): IpcRenderer => {
				WarnLog(
					`ipcRenderer.removeListener for '${ch}' not implemented.`,
				);

				return ipcRendererShimImpl;
			},
		};

		const webFrameShimImpl: WebFrame = {
			setZoomLevel: async (level: number) => {
				try {
					const factor = Math.pow(1.2, level);

					Log(`webFrame.setZoomLevel(${level}) - factor ${factor}.`);
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

				const defaultProfilesValue: {
					home: URI;

					all: readonly ILocalUriDto<IUserDataProfile>[];

					profile: IUserDataProfile;
				} = {
					home: URI.file(
						await tauriJoin(tauriAppData, "User", "profiles"),
					),

					// Ensure 'all' elements are compatible with UriDto<IUserDataProfile>
					// If ILocalUriDto is a simplified version, this might still cause issues if VSCode expects methods or specific instance types from UriDto.
					all: [] as readonly ILocalUriDto<IUserDataProfile>[],

					profile: {
						id: "defaultProfile",

						name: "Default",

						isDefault: true,

						useDefaultFlags: {} as UseDefaultProfileFlags,

						location: defaultProfileLocation,

						...commonProfileProps,

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

					isTransient: false,
				};

				const revivedLoggers: ILocalLoggerResource[] = (
					initialConfigFromMeta.loggers || []
				).map(
					(l: any) =>
						({
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
									: undefined,

							hidden:
								typeof l.hidden === "boolean"
									? l.hidden
									: undefined,

							when:
								typeof l.when === "string" ? l.when : undefined,
						}) as ILocalLoggerResource,
				);

				const nativeConfig: INativeWindowConfiguration = {
					...initialConfigFromMeta,

					windowId:
						initialConfigFromMeta.windowId ??
						Window.getCurrent().label ??
						0,

					machineId: (await invoke("get_machine_id").catch(
						() => "tauri-mc-id",
					)) as string,

					sqmId: (await invoke("get_sqm_id").catch(
						() => "tauri-sqm-id",
					)) as string,

					sessionId: `tauri-sess-${Date.now()}`,

					appRoot:
						initialConfigFromMeta.appRoot ||
						(await tauriResolve(tauriResDir, ".")),

					logsPath: initialConfigFromMeta.logsPath || tauriLogs,

					userEnv: {
						...(sandboxNodeProcessShim.env as ILocalProcessEnvironment),

						...(initialConfigFromMeta.userEnv as ILocalProcessEnvironment),
					} as ILocalProcessEnvironment,

					os: {
						arch,

						hostname: "tauri.localhost",

						release: osRelease,

						platform,

						type: osTypeValueImpl,

						// use osTypeValueImpl
					} as IOSConfiguration,

					colorScheme:
						initialConfigFromMeta.colorScheme ||
						({
							dark: window.matchMedia(
								"(prefers-color-scheme: dark)",
							).matches,

							highContrast: false,
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
						: osTypeValueImpl === "Windows_NT"
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
								| IEmptyWorkspaceIdentifier
								| undefined),

					folderUri:
						initialConfigFromMeta["folder-uri"] instanceof URI
							? initialConfigFromMeta["folder-uri"]
							: undefined,

					workspaceUri:
						initialConfigFromMeta["workspace"] instanceof URI
							? (initialConfigFromMeta["workspace"] as URI)
							: undefined,

					profiles: initialConfigFromMeta.profiles
						? reviveProfileUrisRecursively(
								initialConfigFromMeta.profiles,
							)
						: defaultProfilesValue,

					// Ensure defaultProfile is correctly typed when coming from initialConfigFromMeta
					defaultProfile: initialConfigFromMeta.defaultProfile
						? (reviveProfileUrisRecursively(
								initialConfigFromMeta.defaultProfile,
							) as IUserDataProfile)
						: defaultProfileValue,

					loggers: revivedLoggers,

					autoDetectHighContrast:
						initialConfigFromMeta.autoDetectHighContrast ?? true,

					autoDetectColorScheme:
						initialConfigFromMeta.autoDetectColorScheme ?? true,

					zoomLevel: (typeof initialConfigFromMeta.zoomLevel ===
					"number"
						? initialConfigFromMeta.zoomLevel
						: // Ensure it's number
							0) as number,

					isCustomZoomLevel:
						initialConfigFromMeta.isCustomZoomLevel ?? false,

					productConfiguration: {
						...product,

						...(initialConfigFromMeta.productConfiguration || {}),
					},

					accessibilitySupport:
						initialConfigFromMeta.accessibilitySupport === "on" ||
						initialConfigFromMeta.accessibilitySupport === "off" ||
						initialConfigFromMeta.accessibilitySupport === "unknown"
							? initialConfigFromMeta.accessibilitySupport
							: undefined,

					perfMarks: initialConfigFromMeta.perfMarks || [],

					policiesData: initialConfigFromMeta.policiesData || {},

					// Ensure the default object for partsSplash also meets ILocalPartsSplash (and thus IPartsSplash's requirements)
					partsSplash: initialConfigFromMeta.partsSplash
						? ({
								zoomLevel:
									typeof initialConfigFromMeta.partsSplash
										.zoomLevel === "number"
										? initialConfigFromMeta.partsSplash
												.zoomLevel
										: 0,

								// Spread other optional parts
								...(initialConfigFromMeta.partsSplash as Partial<ILocalPartsSplash>),
							} as ILocalPartsSplash)
						: ({ zoomLevel: 0 } as ILocalPartsSplash),
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
			getPathForFile: (file: File): string => {
				WarnLog(`webUtils.getPathForFile(${file.name})`);

				return (file as any).path || file.name;
			},
		};

		const ipcMessagePortShimImpl: IpcMessagePort = {
			acquire: (respCh: string, nonce: string) =>
				WarnLog(`ipcMP.acquire ${respCh}, ${nonce}`),
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

		errDiv.textContent = `Tauri Preload Error: ${error instanceof Error ? error.message : String(error)}. Check console.`;

		errDiv.style.cssText =
			"color:red;padding:20px;font-family:sans-serif;white-space:pre-wrap;";

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
