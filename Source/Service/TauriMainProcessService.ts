/**
 * @module TauriMainProcessService
 *
 * @description
 * Drop-in replacement for VS Code's ElectronIPCMainProcessService.
 * Implements IMainProcessService by routing channel.call() directly
 * through Tauri invoke to Mountain's WindServiceHandlers.
 *
 * Eliminates the binary IPC protocol entirely — no serialize/deserialize,
 * no vscode:hello/vscode:message, no ChannelClient/ChannelServer.
 *
 * VS Code desktop workbench calls:
 *   mainProcessService.getChannel('localFilesystem').call('stat', [uri])
 *
 * This routes to:
 *   Tauri.invoke("MountainIPCInvoke", { method: "file:stat", params: [uri] })
 *
 * Mountain's WindServiceHandlers.rs handles the rest.
 */

import type { Event as VSCodeEvent } from "@codeeditorland/output/vs/base/common/event";
import type {
	IChannel,
	IServerChannel,
} from "@codeeditorland/output/vs/base/parts/ipc/common/ipc";

// Inline DevLog — can't import from ../Function/ because this file is served
// from /Static/Application/vs/platform/ipc/ where relative imports break.
const DevLog = (Tag: string, ...Args: unknown[]): void => {
	const Filter = (window as any).__LAND_DEV_LOG;
	if (!Filter) return;
	const Lower = Tag.toLowerCase();
	if (
		Filter === "all" ||
		String(Filter)
			.split(",")
			.some((T: string) => T.trim().toLowerCase() === Lower)
	) {
		console.log(`[DEV:${Tag.toUpperCase()}]`, ...Args);
	}
};

// ============================================================================
// Channel → Mountain Route Mapping
// ============================================================================

/**
 * Maps VS Code IPC channel names to Mountain WindServiceHandlers route prefixes.
 * VS Code: channel.call('stat', args) → Mountain: "file:stat"
 */
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
	// Phase 2: Window management + OS integration
	nativeHost: "nativeHost",
	// Phase 3: Terminal PTY
	localPty: "localPty",
	// Phase 2.5: Remaining channels routed to Mountain
	update: "update",
	url: "url",
	menubar: "menubar",
	encryption: "encryption",
	extensionHostStarter: "extensionHostStarter",
	extensionhostdebugservice: "extensionhostdebugservice",
};

/**
 * Channels where call() can be fire-and-forget (no real response needed).
 * Returns undefined immediately instead of going through Tauri.
 */
const FireAndForgetChannels = new Set(["logger"]);

/**
 * Channels where errors must be thrown (not swallowed) so VS Code's
 * fileService.js can catch FileNotFound and create missing dirs/files.
 */
const FileSystemChannels = new Set(["localFilesystem"]);
const FileSystemThrowCommands = new Set([
	"stat",
	"readFile",
	"writeFile",
	"readdir",
	"mkdir",
	"delete",
	"rename",
	"copy",
	"open",
	"close",
	"read",
	"write",
	"realpath",
	"cloneFile",
]);

/**
 * Channels that don't exist in Mountain yet — return stub responses
 * to prevent hangs. These should be wired to real handlers over time.
 */
const StubChannels: Record<string, Record<string, unknown>> = {
	// Electron-specific channels that have no Tauri equivalent.
	// Everything else routes to Mountain for real handling.
	sign: { sign: "", createNewMessage: "", validate: true },
	policy: { serialize: {}, registerPolicyChange: undefined },
	userDataProfiles: {},
	keyboardLayout: {
		getKeyboardLayoutData: {
			keyboardLayoutInfo: {
				model: "pc105",
				layout: "us",
				variant: "",
				options: "",
				rules: "",
			},
			keyboardMapping: {},
		},
	},
	sharedProcess: {},
	utilityProcessWorker: { createWorker: undefined },
	// Channels with no desktop equivalent in Tauri
	meteredConnection: {},
	webContentExtractor: {},
	browserElements: {},
	NativeMcpDiscoveryHelper: { load: undefined },
	sandboxHelper: {},
};

// ============================================================================
// Tauri Invoke
// ============================================================================

async function InvokeMountain(
	Method: string,
	Params: unknown[],
): Promise<unknown> {
	// Tauri 2.x: window.__TAURI__.core.invoke()
	// Tauri 1.x: window.__TAURI__.invoke()
	const Invoke =
		(window as any).__TAURI__?.core?.invoke ??
		(window as any).__TAURI__?.invoke;

	if (typeof Invoke !== "function") {
		console.warn(
			`[TauriMainProcessService] Tauri not available for: ${Method}`,
		);
		return undefined;
	}

	return await Invoke("MountainIPCInvoke", {
		method: Method,
		params: Params,
	});
}

// ============================================================================
// TauriChannel — implements IChannel
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
		DevLog("ipc", `${this.ChannelName}.${Command}`);

		// Fire-and-forget channels
		if (FireAndForgetChannels.has(this.ChannelName)) {
			// Still send to Mountain but don't await
			if (this.RoutePrefix) {
				InvokeMountain(
					`${this.RoutePrefix}:${Command}`,
					Arg !== undefined ? (Array.isArray(Arg) ? Arg : [Arg]) : [],
				).catch(() => {});
			}
			return undefined as T;
		}

		// Stub channels (not yet wired to Mountain)
		const Stubs = StubChannels[this.ChannelName];
		if (Stubs !== undefined) {
			const StubValue = Stubs[Command];
			if (StubValue !== undefined) {
				return StubValue as T;
			}
			return undefined as T;
		}

		// Route through Mountain
		if (this.RoutePrefix) {
			const MountainMethod = `${this.RoutePrefix}:${Command}`;
			const Params =
				Arg !== undefined ? (Array.isArray(Arg) ? Arg : [Arg]) : [];

			try {
				const Result = await InvokeMountain(MountainMethod, Params);
				// File read commands return { buffer: number[] } from Mountain.
				// VS Code's IPCFileSystemProvider does: `const buf = await call<VSBuffer>('readFile', uri); return buf.buffer;`
				// So `buf.buffer` must return a Uint8Array (not an ArrayBuffer).
				// Return a VSBuffer-shaped object: { buffer: Uint8Array, byteLength: number }.
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
				// File system errors must be RETHROWN so VS Code's
				// fileService.js can catch them as FileNotFound/etc.
				// The mkdirp/readFile/writeFile code relies on
				// stat() throwing to know the file doesn't exist.
				if (
					FileSystemChannels.has(this.ChannelName) &&
					FileSystemThrowCommands.has(Command)
				) {
					// Wrap with FileSystemProviderErrorCode so VS Code
					// recognizes it. Code 1 = FileNotFound, 6 = NoPermissions.
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
				// Other channels: return undefined on error to avoid
				// hangs in services that don't handle rejections.
				console.warn(
					`[TauriMainProcessService] ${this.ChannelName}.${Command} failed (returning undefined):`,
					RawError,
				);
				return undefined as T;
			}
		}

		// Unknown channel — log and return undefined
		console.warn(
			`[TauriMainProcessService] Unknown channel: ${this.ChannelName}.${Command}`,
		);
		return undefined as T;
	}

	listen<T>(_Event: string, _Arg?: unknown): VSCodeEvent<T> {
		// Event subscriptions — return a no-op event for now.
		// These should be wired to Tauri event listeners (AppHandle.emit)
		// when Mountain emits sky:// events.
		return (() => ({ dispose: () => {} })) as unknown as VSCodeEvent<T>;
	}
}

// ============================================================================
// TauriMainProcessService — implements IMainProcessService
// ============================================================================

/**
 * Drop-in replacement for ElectronIPCMainProcessService.
 * Routes getChannel().call() through Tauri invoke to Mountain.
 */
export class TauriMainProcessService {
	declare readonly _serviceBrand: undefined;

	private readonly Channels = new Map<string, TauriChannel>();

	constructor(_WindowId: number) {
		console.log(
			`[TauriMainProcessService] Created for window ${_WindowId}`,
		);
	}

	getChannel(ChannelName: string): IChannel {
		let Channel = this.Channels.get(ChannelName);
		if (!Channel) {
			const RoutePrefix = ChannelRouteMap[ChannelName] ?? null;
			Channel = new TauriChannel(ChannelName, RoutePrefix);
			this.Channels.set(ChannelName, Channel);

			if (!RoutePrefix && !StubChannels[ChannelName]) {
				console.warn(
					`[TauriMainProcessService] No Mountain route for channel: ${ChannelName}`,
				);
			}
		}
		return Channel;
	}

	registerChannel(
		_ChannelName: string,
		_Channel: IServerChannel<string>,
	): void {
		// In Electron, the renderer registers channels that the main process
		// can call back into. For Tauri, this is handled by sky:// events.
	}

	dispose(): void {
		this.Channels.clear();
	}
}

export default TauriMainProcessService;
