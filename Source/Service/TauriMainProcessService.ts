/**
 * @module TauriMainProcessService
 *
 * Drop-in replacement for VS Code's ElectronIPCMainProcessService.
 * Routes channel.call() through Tauri invoke to Mountain's WindServiceHandlers.
 *
 * Zero console.* output. Tracing via performance.mark().
 * Build-baked OTEL bridge (OTELBridge.ts) collects marks automatically.
 */

import type { Event as VSCodeEvent } from "@codeeditorland/output/vs/base/common/event";
import type {
	IChannel,
	IServerChannel,
} from "@codeeditorland/output/vs/base/parts/ipc/common/ipc";

// Inline trace - performance.mark() collected by build-baked OTELBridge.
const _Trace = (Tag: string, Message: string): void => {
	try { performance.mark(`land:${Tag}:${Message}`); } catch {}
};

// Timed trace - wraps an async operation with start/end marks + measure.
// OTELBridge picks up the measure as a span with real duration.
const _TimedTrace = async <T>(
	Tag: string,
	Label: string,
	Fn: () => Promise<T>,
): Promise<T> => {
	const MarkName = `land:${Tag}:${Label}`;
	const StartMark = `${MarkName}:start`;
	try { performance.mark(StartMark); } catch {}
	try {
		const Result = await Fn();
		try { performance.measure(MarkName, StartMark); } catch {}
		return Result;
	} catch (Error) {
		try { performance.mark(`${MarkName}:error`, { detail: { error: String(Error) } }); } catch {}
		try { performance.measure(MarkName, StartMark); } catch {}
		throw Error;
	}
};

// ============================================================================
// Channel → Mountain Route Mapping
// ============================================================================

const ChannelRouteMap: Record<string, string> = {
	localFilesystem: "file",
	storage: "storage",
	logger: "logger",
	configuration: "configuration",
	textFile: "textFile",
	extensions: "extensions",
	commands: "commands",
	terminal: "terminal",
	output: "output",
	notification: "notification",
	progress: "progress",
	quickInput: "quickInput",
	workspaces: "workspaces",
	themes: "themes",
	search: "search",
	environment: "environment",
	decorations: "decorations",
	workingCopy: "workingCopy",
	keybinding: "keybinding",
	lifecycle: "lifecycle",
	label: "label",
	model: "model",
	nativeHost: "nativeHost",
	localPty: "localPty",
	// update: stubbed — Mountain doesn't implement IUpdateService yet
	url: "url",
	menubar: "menubar",
	encryption: "encryption",
	extensionHostStarter: "extensionHostStarter",
	extensionhostdebugservice: "extensionhostdebugservice",
};

const FireAndForgetChannels = new Set(["logger", "output"]);

const FileSystemChannels = new Set(["localFilesystem"]);
const FileSystemThrowCommands = new Set([
	"stat", "readFile", "writeFile", "readdir", "mkdir",
	"delete", "rename", "copy", "open", "close",
	"read", "write", "realpath", "cloneFile",
]);

const StubChannels: Record<string, Record<string, unknown>> = {
	sign: { sign: "", createNewMessage: "", validate: true },
	policy: { serialize: {}, registerPolicyChange: undefined },
	userDataProfiles: {},
	keyboardLayout: {
		getKeyboardLayoutData: {
			keyboardLayoutInfo: {
				model: "pc105", layout: "us", variant: "",
				options: "", rules: "",
			},
			keyboardMapping: {},
		},
	},
	sharedProcess: {},
	utilityProcessWorker: {
		createWorker: { onDidTerminate: new Promise(() => {}) },
		disposeWorker: undefined,
	},
	meteredConnection: {},
	webContentExtractor: {},
	browserElements: {},
	NativeMcpDiscoveryHelper: { load: undefined },
	sandboxHelper: {},
	mcpGateway: {},
	browserViewGroup: {},

	// Fix: terminals.windows — IExternalTerminalService.getDefaultTerminalForPlatforms()
	externalTerminal: {
		getDefaultTerminalForPlatforms: {
			windows: "cmd.exe",
			linux: "/usr/bin/x-terminal-emulator",
			osx: "Terminal.app",
		},
	},

	// Fix: update.setInternalOrg — IUpdateService methods
	update: {
		checkForUpdates: { updateType: 0 },
		downloadUpdate: undefined,
		applyUpdate: undefined,
		quitAndInstall: undefined,
		isLatestVersion: true,
		setInternalOrg: undefined,
		_getInitialState: { type: 0 },
	},
};

// ============================================================================
// Tauri Invoke
// ============================================================================

async function InvokeMountain(
	Method: string,
	Params: unknown[],
): Promise<unknown> {
	const Invoke =
		(window as any).__TAURI__?.core?.invoke ??
		(window as any).__TAURI__?.invoke;

	if (typeof Invoke !== "function") return undefined;

	return await Invoke("MountainIPCInvoke", {
		method: Method,
		params: Params,
	});
}

// ============================================================================
// TauriChannel - implements IChannel
// ============================================================================

class TauriChannel implements IChannel {
	constructor(
		private readonly ChannelName: string,
		private readonly RoutePrefix: string | null,
	) {}

	async call<T>(
		Command: string,
		Arg?: unknown,
		_CancellationToken?: unknown,
	): Promise<T> {
		_Trace("ipc", `${this.ChannelName}.${Command}`);

		if (FireAndForgetChannels.has(this.ChannelName)) {
			if (this.RoutePrefix) {
				InvokeMountain(
					`${this.RoutePrefix}:${Command}`,
					Arg !== undefined ? (Array.isArray(Arg) ? Arg : [Arg]) : [],
				).catch(() => {});
			}
			return undefined as T;
		}

		const Stubs = StubChannels[this.ChannelName];
		if (Stubs !== undefined) {
			_Trace("ipc", `stub:${this.ChannelName}.${Command}`);
			const StubValue = Stubs[Command];
			return (StubValue !== undefined ? StubValue : undefined) as T;
		}

		if (this.RoutePrefix) {
			const MountainMethod = `${this.RoutePrefix}:${Command}`;
			const Params =
				Arg !== undefined ? (Array.isArray(Arg) ? Arg : [Arg]) : [];

			try {
				const Result = await _TimedTrace(
					"ipc",
					MountainMethod,
					() => InvokeMountain(MountainMethod, Params),
				);

				if (
					FileSystemChannels.has(this.ChannelName) &&
					(Command === "readFile" || Command === "read")
				) {
					const Raw = Result as
						| { buffer: number[] }
						| number[]
						| null
						| undefined;
					if (Raw !== null && Raw !== undefined) {
						const Arr = Array.isArray(Raw)
							? Raw
							: (Raw as { buffer: number[] }).buffer;
						if (Array.isArray(Arr)) {
							const Bytes = new Uint8Array(Arr);
							return {
								buffer: Bytes,
								byteLength: Bytes.byteLength,
							} as unknown as T;
						}
					}
				}
				return Result as T;
			} catch (RawError) {
				if (
					FileSystemChannels.has(this.ChannelName) &&
					FileSystemThrowCommands.has(Command)
				) {
					const ErrorMsg = String(RawError);
					const WrappedError = new Error(ErrorMsg) as any;
					if (
						ErrorMsg.includes("No such file or directory") ||
						ErrorMsg.includes("ENOENT") ||
						ErrorMsg.includes("not found")
					) {
						WrappedError.code = "FileNotFound";
						WrappedError.fileOperationResult = 1;
					} else if (
						ErrorMsg.includes("Permission denied") ||
						ErrorMsg.includes("EACCES")
					) {
						WrappedError.code = "NoPermissions";
						WrappedError.fileOperationResult = 6;
					} else if (
						ErrorMsg.includes("File exists") ||
						ErrorMsg.includes("EEXIST")
					) {
						WrappedError.code = "FileExists";
						WrappedError.fileOperationResult = 4;
					}
					throw WrappedError;
				}
				_Trace("ipc", `error:${this.ChannelName}.${Command}`);
				return undefined as T;
			}
		}

		_Trace("ipc", `unknown:${this.ChannelName}.${Command}`);
		return undefined as T;
	}

	listen<T>(Event: string, Arg?: unknown): VSCodeEvent<T> {
		_Trace("ipc", `listen:${this.ChannelName}.${Event}`);

		if (
			FileSystemChannels.has(this.ChannelName) &&
			Event === "readFileStream"
		) {
			return ((Listener: (DataOrErrorOrEnd: unknown) => void) => {
				const Params =
					Arg !== undefined ? (Array.isArray(Arg) ? Arg : [Arg]) : [];

				Promise.all([
					import("../../../base/common/buffer.js") as Promise<{
						VSBuffer: { wrap(buffer: Uint8Array): unknown };
					}>,
					InvokeMountain(`${this.RoutePrefix}:readFile`, Params),
				])
					.then(([{ VSBuffer }, Result]) => {
						const Raw = Result as
							| { buffer: number[] }
							| number[]
							| null
							| undefined;
						if (Raw !== null && Raw !== undefined) {
							const Arr = Array.isArray(Raw)
								? Raw
								: (Raw as { buffer: number[] }).buffer;
							if (Array.isArray(Arr)) {
								Listener(VSBuffer.wrap(new Uint8Array(Arr)));
							}
						}
						Listener("end" as unknown);
					})
					.catch((Err) => {
						Listener(Err);
					});

				return { dispose: () => {} };
			}) as unknown as VSCodeEvent<T>;
		}

		return (() => ({ dispose: () => {} })) as unknown as VSCodeEvent<T>;
	}
}

// ============================================================================
// TauriMainProcessService - implements IMainProcessService
// ============================================================================

export class TauriMainProcessService {
	declare readonly _serviceBrand: undefined;

	private readonly Channels = new Map<string, TauriChannel>();

	constructor(_WindowId: number) {
		_Trace("ipc", `TauriMainProcessService:window=${_WindowId}`);
	}

	getChannel(ChannelName: string): IChannel {
		let Channel = this.Channels.get(ChannelName);
		if (!Channel) {
			const RoutePrefix = ChannelRouteMap[ChannelName] ?? null;
			Channel = new TauriChannel(ChannelName, RoutePrefix);
			this.Channels.set(ChannelName, Channel);
		}
		return Channel;
	}

	registerChannel(
		_ChannelName: string,
		_Channel: IServerChannel<string>,
	): void {}

	dispose(): void {
		this.Channels.clear();
	}
}

export default TauriMainProcessService;
