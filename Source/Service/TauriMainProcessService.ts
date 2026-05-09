/**
 * @module TauriMainProcessService
 *
 * Drop-in replacement for VS Code's ElectronIPCMainProcessService.
 * Routes channel.call() through Tauri invoke to Mountain's WindServiceHandlers.
 *
 * Zero console.* output. Tracing via performance.mark().
 * Build-baked OTEL bridge (OTELBridge.ts) collects marks automatically.
 */

import type { Event as VSCodeEvent } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/common/event.js";
import type {
	IChannel,
	IServerChannel,
} from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/parts/ipc/common/ipc.js";

// Inline trace - performance.mark() collected by build-baked OTELBridge.
const _Trace = (Tag: string, Message: string): void => {
	try {
		performance.mark(`land:${Tag}:${Message}`);
	} catch {}
};

// Mirror a tagged line into Mountain's dev-log file sink so
// `Trace=<tag> tail -f Mountain.dev.log` picks up TS-originated
// traffic alongside Rust `dev_log!` output. Fire-and-forget - never
// awaits, never throws. Mountain short-circuits cheaply when the tag
// isn't enabled. Sends BOTH casings (`Tag`/`Message` + `tag`/`message`)
// so Tauri's param-case handling doesn't require a guess - the Rust
// command coalesces whichever arrived populated.
const _DevLogForward = (Tag: string, Message: string): void => {
	try {
		const Internals = (window as any).__TAURI_INTERNALS__;

		const Invoke =
			(window as any).__TAURI__?.core?.invoke ??
			(window as any).__TAURI__?.invoke ??
			Internals?.invoke;

		if (typeof Invoke !== "function") return;

		Invoke("RenderDevLog", {
			Tag,
			Message,
			tag: Tag,
			message: Message,
		}).catch(() => {});
	} catch {}
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

	try {
		performance.mark(StartMark);
	} catch {}

	try {
		const Result = await Fn();

		try {
			performance.measure(MarkName, StartMark);
		} catch {}

		return Result;
	} catch (Error) {
		try {
			performance.mark(`${MarkName}:error`, {
				detail: { error: String(Error) },
			});
		} catch {}

		try {
			performance.measure(MarkName, StartMark);
		} catch {}

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

	// Route the Extensions-sidebar IPC channels into Mountain's
	// existing `extensions:*` handlers. See the twin comment in
	// `Element/Output/Source/Service/TauriMainProcessService.ts` -
	// Wind and Output ship two copies of this service depending on
	// workbench flavour, so the mapping has to be duplicated here to
	// keep them aligned.
	extensionManagement: "extensions",

	extensionGallery: "extensions",

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

	// update: stubbed - Mountain doesn't implement IUpdateService yet
	url: "url",

	menubar: "menubar",

	encryption: "encryption",

	extensionHostStarter: "extensionHostStarter",

	extensionhostdebugservice: "extensionhostdebugservice",

	// Git: the built-in `git` extension's `MainProcessService.getChannel("localGit")`
	// path. Stock VS Code backs this with `ILocalGitService` in the shared
	// process; Land routes every method (`exec`, `clone`, `pull`, `checkout`,
	// `revParse`, `fetch`, `revListCount`, `cancel`, `isAvailable`) to
	// Mountain's `git:*` subprocess handlers (see
	// `Mountain/Source/IPC/WindServiceHandlers/Git.rs`).
	localGit: "git",
};

const FireAndForgetChannels = new Set(["logger", "output"]);

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

const StubChannels: Record<string, Record<string, unknown>> = {
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

	// Fix: terminals.windows - IExternalTerminalService.getDefaultTerminalForPlatforms()
	externalTerminal: {
		getDefaultTerminalForPlatforms: {
			windows: "cmd.exe",

			linux: "/usr/bin/x-terminal-emulator",

			osx: "Terminal.app",
		},
	},

	// Fix: update.setInternalOrg - IUpdateService methods
	update: {
		checkForUpdates: { updateType: 0 },

		downloadUpdate: undefined,

		applyUpdate: undefined,

		quitAndInstall: undefined,

		isLatestVersion: true,

		setInternalOrg: undefined,

		_getInitialState: { type: 0 },
	},

	// Fix: webview - `IWebviewManagerService` stub. Stock VS Code uses
	// this channel (electron-browser/windowIgnoreMenuShortcutsManager.ts)
	// to disable native menu shortcuts while a webview has focus on
	// macOS / native-titlebar Linux. Tauri's WKWebView has no electron
	// menu to disable, so every call is a no-op. Mirror of the Output
	// copy (`Element/Output/Source/Service/TauriMainProcessService.ts`)
	// so the Wind/Output lockstep rule holds.
	webview: {
		setIgnoreMenuShortcuts: undefined,

		setContextMenuVisible: undefined,

		hideReference: undefined,

		showReference: undefined,
	},

	// Fix: watcher - `IFileWatcherService` stub. Land routes file
	// watching via Mountain's typed `FileWatcher.Register` IPC, not
	// through the platform's `watcher` channel. Stub the legacy ops to
	// stop them from hitting `Unknown method` paths during workbench
	// boot. Mirror of Output copy.
	watcher: {
		watch: undefined,

		unwatch: undefined,

		setVerboseLogging: undefined,
	},

	// Fix: urlHandler - `IURLService` stub. `vscode://<path>` deeplink
	// handlers register through this channel; without it any extension
	// that calls `vscode.window.registerUriHandler(...)` would hit
	// `Unknown method` on Cocoon's `MainProcessService.getChannel`. Stub
	// to no-ops for now - `open: false` signals "no handler took the
	// URI", which is the same fall-through the workbench applies in
	// stock VS Code when no extension claims the URI.
	urlHandler: {
		registerHandler: undefined,

		open: false,

		create: undefined,
	},

	// Fix: download - `IDownloadService` stub. Extension gallery's
	// optional download path looks for this channel; in Land we have
	// no remote gallery so the only legitimate caller is a `vsix`
	// install where the stream comes from disk. Returning undefined
	// keeps the workbench's `download(uri).then(local => ...)` chain
	// resolving with no body so the caller surfaces a friendly
	// "download not supported" rather than crashing.
	download: {
		download: undefined,
	},

	// Fix: `IExtensionTipsService` - `exeBasedRecommendations.ts:54` does
	// `this._importantTips = await …getImportantExecutableBasedTips()` and
	// the next line iterates with `.forEach`. Without a stub the IPC call
	// rejects → `undefined` seeps through → `undefined.forEach` crashes
	// with `undefined is not an object (evaluating 'this._importantTips.forEach')`.
	// Land doesn't host an exe-based recommendation backend, so an empty
	// array is the correct "no recommendations" shape. `configBasedTips`
	// maps to the same service's config-based counterpart - also empty.
	extensionTipsService: {
		getImportantExecutableBasedTips: [],

		getOtherExecutableBasedTips: [],

		getAllWorkspacesTips: [],

		getConfigBasedTips: [],

		getImportantExecutableBasedTipsForExecutable: [],
	},

	// Fix: `IMcpManagementService` channel - `mcpManagementIpc.ts:167`
	// calls `.then(servers => servers.map(…))` expecting an array. Missing
	// handler → undefined → `.map` crashes with
	// `undefined is not an object (evaluating 'servers.map')`. Empty
	// array = "no MCP servers installed", which matches the absence of a
	// Mountain-side MCP gallery.
	mcpManagement: {
		getInstalled: [],

		install: undefined,

		uninstall: undefined,

		getGalleryServers: [],

		getLatest: undefined,
	},

	mcpWorkbenchManagement: {
		getInstalled: [],

		getLocalServers: [],

		install: undefined,

		uninstall: undefined,
	},

	// Fix: `IUserDataSyncService._getInitialData` returns a 3-tuple
	// `[status, conflicts, lastSyncTime]` that `userDataSyncServiceIpc.ts:165`
	// destructures. Channel name is `userDataSync` (registered in
	// `workbench/services/userDataSync/electron-browser/userDataSyncService.ts:13`),
	// not `userDataSyncService`. Return Uninitialised / no conflicts / never
	// synced so the workbench treats sync as disabled.
	userDataSync: {
		_getInitialData: [0, [], null],

		accept: undefined,

		resolveContent: null,

		replace: undefined,

		reset: undefined,

		stop: undefined,

		pull: undefined,

		hasPreviouslySynced: false,

		hasLocalData: false,

		turnOn: undefined,

		turnOff: undefined,
	},

	// `IUserDataSyncAccountService._getInitialData` returns the account or
	// `undefined` when no account is signed in. Channel name is
	// `userDataSyncAccount` - matches `userDataSyncIpc.ts:51` callsite.
	userDataSyncAccount: {
		_getInitialData: undefined,

		getAccount: undefined,
	},

	userDataSyncStoreManagement: {
		_getInitialData: null,
	},

	userDataAutoSync: {
		triggerSync: undefined,

		turnOn: undefined,

		turnOff: undefined,
	},

	// Fix: `languageDetectionWorkerService` - iterates
	// `fileExtensions.extensions` and crashes when the IPC returns
	// undefined. Empty result = "language detection disabled",
	// matching the absence of the ML detector in Land.
	languageDetection: {
		detectLanguage: null,

		provideLanguageDetectionHints: { fileExtensions: { extensions: [] } },
	},

	// Fix: `telemetryAppender` channel - stock VS Code's
	// TelemetryChannelAppender posts every single event through the
	// shared-process `telemetryAppender` IPC channel. Land has no
	// shared process and no telemetry backend, so every call falls
	// through to `InvokeMountain("undefined:log")`. Observed at 155
	// calls per boot in `channel-stub` tag output - by far the hottest
	// miss. Stub with the expected `log`/`flush` no-ops so the
	// appender short-circuits in the stub path instead of chewing
	// a Tauri round-trip each time.
	telemetryAppender: {
		log: undefined,

		flush: undefined,
	},

	// Fix: `mcpGalleryManifest` channel - MCP extension marketplace
	// manifest bootstrap. `channel-stub` tag surfaced this as the sole
	// remaining `miss` per session. The workbench calls
	// `setMcpGalleryManifest({...})` once at boot to seed the MCP
	// gallery state; a no-op stub is sufficient until Land has an MCP
	// registry of its own to wire in.
	mcpGalleryManifest: {
		setMcpGalleryManifest: undefined,
	},

	// extensionGalleryManifest: workbench seeds gallery metadata via
	// `setExtensionGalleryManifest({...})` at boot. Output copy had the
	// entry stubbed as `{}` before the key was named explicitly; adding
	// to Wind for lockstep even though the Output bundle is the active
	// runtime copy per the 2026-04 channel-stub forensic round.
	extensionGalleryManifest: {
		setExtensionGalleryManifest: undefined,
	},

	// Fix: `languageDetectionWorkerServiceImpl.resolveWorkspaceLanguageIds`
	// calls `_diagnosticsService.getWorkspaceFileExtensions(workspace)`
	// synchronously inside a `for (const ext of fileExtensions.extensions)`
	// loop. Stock VS Code wires `IDiagnosticsService` to the shared-process
	// `diagnostics` channel; Land has no shared process, so the call
	// returns `undefined` and the loop throws `TypeError: undefined is
	// not an object (evaluating 'fileExtensions.extensions')`. Stub the
	// channel with an empty-extensions shape so language detection just
	// contributes no workspace-derived biases and continues.
	diagnostics: {
		getWorkspaceFileExtensions: { extensions: [] },

		getDiagnostics: [],

		getSystemInfo: {},

		getPerformanceInfo: {},

		reportWorkspaceStats: {
			configFiles: [],

			fileTypes: [],

			launchConfigFiles: [],
		},
	},

	// --- Batch 6: medium-priority channels stock VS Code exposes via the
	// shared/main process that Land doesn't have. Mirror of the Output
	// copy in `Element/Output/Source/Service/TauriMainProcessService.ts` -
	// BOTH files must line-match per the Wind/Output lockstep rule
	// (HANDOFF §-10 Trap 4). Shapes track the matching `I*Service`
	// interface under VS Code's `vs/platform/**/common/*.ts`.
	test: {
		getResults: [],
		addResult: undefined,
		clearResults: undefined,
	},
	profileStorageListener: {
		onDidChange: undefined,
	},
	checksum: {
		checksum: "",
	},
	languagePacks: {
		getAvailableLanguages: [],
		getInstalledLanguages: [],
		getBuiltInExtensionTranslationsUri: undefined,
	},
	userDataSyncUtil: {
		resolveDefaultIgnoredSettings: [],
		resolveUserKeybindings: {},
		resolveFormattingOptions: {
			eol: "\n",
			insertSpaces: true,
			tabSize: 4,
		},
	},
	userDataSyncMachines: {
		getMachines: [],
		addCurrentMachine: undefined,
		removeCurrentMachine: undefined,
		renameMachine: undefined,
		setEnablements: undefined,
	},
	IUserDataSyncResourceProviderService: {
		getRemoteSyncedProfiles: [],
		getLocalSyncedProfiles: [],
		getRemoteSyncResourceHandles: [],
		getLocalSyncResourceHandles: [],
		getAssociatedResources: [],
		getMachineId: undefined,
		getLocalSyncedMachines: [],
		resolveContent: null,
	},
	customEndpointTelemetry: {
		publicLog: undefined,
		publicLogError: undefined,
	},
	process: {
		createTunnel: { id: "" },
		startTunnel: {},
		setAddress: undefined,
		setTunnelInUse: undefined,
		destroyTunnel: undefined,
	},
	remoteTunnel: {
		getTunnelStatus: { type: "disconnected" },
		getMode: { active: false },
		initialize: { type: "disconnected" },
		startTunnel: { type: "disconnected" },
		stopTunnel: undefined,
		getTunnelName: null,
		getAccount: null,
		getSessionToken: null,
	},
	sharedWebContentExtractor: {
		readImage: undefined,
	},
	playwright: {
		__initialize: undefined,
		click: undefined,
		hover: undefined,
		drag: undefined,
		fill: undefined,
		select: undefined,
		screenshot: null,
		snapshot: null,
		evaluate: null,
	},
	v8InspectProfiling: {
		startProfiling: "",
		stopProfiling: {
			nodes: [],
			samples: [],
			timeDeltas: [],
			startTime: 0,
			endTime: 0,
		},
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

	// `tauri-invoke` tag: previously fired `_DevLogForward` after EVERY
	// successful (and failed) `MountainIPCInvoke`. Even though
	// Mountain's `dev_log!` macro silently drops disabled tags, the
	// IPC ROUND TRIP that delivers the log line ALREADY HAPPENED -
	// Tauri's invoke channel serialises the call and queues it behind
	// any in-flight invokes. During extension boot this *doubled* IPC
	// traffic and saturated the channel, queueing keystrokes (which
	// share the same WebKit message channel as IPC replies on macOS)
	// behind the log noise. Symptom: the user typed in the editor,
	// nothing visible happened, then later switched focus and the
	// queued keystrokes flushed into the new focused element. Mirror
	// of the Output-side fix - drop the success-case forward; the
	// Rust-side `[DEV:IPC] done: <method> ok=true t_ns=…` line
	// already carries the same data at ns precision and is
	// filterable via `Trace=ipc`. Failures still forward (rare,
	// stack-trace context worth the cost).
	const Start =
		typeof performance !== "undefined" ? performance.now() : Date.now();
	try {
		return await Invoke("MountainIPCInvoke", {
			method: Method,
			params: Params,
		});
	} catch (Error) {
		const Elapsed =
			(typeof performance !== "undefined"
				? performance.now()
				: Date.now()) - Start;
		_DevLogForward(
			"tauri-invoke",
			`[TauriInvoke] method=${Method} ok=false elapsed_ms=${Elapsed.toFixed(2)} err=${String(Error)}`,
		);
		throw Error;
	}
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
			// `_DevLogForward("channel-stub", "fire-and-forget …")`
			// dropped here for the same IPC-saturation reason as the
			// success-case `tauri-invoke` forward above. Mirror of the
			// Output-side fix.
			return undefined as T;
		}

		const Stubs = StubChannels[this.ChannelName];
		if (Stubs !== undefined) {
			_Trace("ipc", `stub:${this.ChannelName}.${Command}`);
			const StubValue = Stubs[Command];
			// Disposition: `value` = real payload, `noop` = undefined on
			// purpose, `drift` = key missing from stub object (worth
			// investigating). Mirror of the Output copy.
			const Disposition = Object.prototype.hasOwnProperty.call(
				Stubs,
				Command,
			)
				? StubValue === undefined
					? "noop"
					: "value"
				: "drift";
			// Only forward for `drift` - the noteworthy case. `value` /
			// `noop` are routine and would saturate the IPC channel.
			if (Disposition === "drift") {
				_DevLogForward(
					"channel-stub",
					`stub-hit channel=${this.ChannelName} cmd=${Command} disposition=${Disposition}`,
				);
			}
			return (StubValue !== undefined ? StubValue : undefined) as T;
		}

		if (this.RoutePrefix) {
			const MountainMethod = `${this.RoutePrefix}:${Command}`;
			const Params =
				Arg !== undefined ? (Array.isArray(Arg) ? Arg : [Arg]) : [];

			try {
				const Result = await _TimedTrace("ipc", MountainMethod, () =>
					InvokeMountain(MountainMethod, Params),
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
		_DevLogForward(
			"channel-stub",
			`miss channel=${this.ChannelName} cmd=${Command} (no route, no stub)`,
		);
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

		// ----------------------------------------------------------------
		// localFilesystem - fileChange (file watcher notifications)
		// ----------------------------------------------------------------
		if (
			FileSystemChannels.has(this.ChannelName) &&
			Event === "fileChange"
		) {
			return ((Listener: (Data: unknown) => void) => {
				const Unlisten = (window as any).__TAURI__?.event?.listen(
					"sky://vfs/fileChange",
					(TauriEvent: any) => Listener(TauriEvent.payload),
				);
				return {
					dispose: () => {
						Unlisten?.then((F: () => void) => F());
					},
				};
			}) as unknown as VSCodeEvent<T>;
		}

		// ----------------------------------------------------------------
		// configuration - onDidChangeConfiguration
		// ----------------------------------------------------------------
		if (
			this.ChannelName === "configuration" &&
			Event === "onDidChangeConfiguration"
		) {
			return ((Listener: (Data: unknown) => void) => {
				const Unlisten = (window as any).__TAURI__?.event?.listen(
					"sky://configuration/changed",
					(TauriEvent: any) => Listener(TauriEvent.payload),
				);
				return {
					dispose: () => {
						Unlisten?.then((F: () => void) => F());
					},
				};
			}) as unknown as VSCodeEvent<T>;
		}

		// ----------------------------------------------------------------
		// terminal - onTerminalData
		// ----------------------------------------------------------------
		if (this.ChannelName === "terminal" && Event === "onTerminalData") {
			return ((Listener: (Data: unknown) => void) => {
				const Unlisten = (window as any).__TAURI__?.event?.listen(
					"sky://terminal/data",
					(TauriEvent: any) => Listener(TauriEvent.payload),
				);
				return {
					dispose: () => {
						Unlisten?.then((F: () => void) => F());
					},
				};
			}) as unknown as VSCodeEvent<T>;
		}

		// ----------------------------------------------------------------
		// terminal - onTerminalCreate / onTerminalExit
		//
		// Mountain emits `sky://terminal/create` and `sky://terminal/exit`
		// (BATCH-19 Part B). Exposing them on the `terminal` channel as
		// `onTerminalCreate`/`onTerminalExit` lets workbench components
		// (the terminal panel, ITerminalInstanceService) learn about
		// lifecycle transitions without polling.
		// ----------------------------------------------------------------
		if (
			this.ChannelName === "terminal" &&
			(Event === "onTerminalCreate" || Event === "onTerminalExit")
		) {
			const Channel =
				Event === "onTerminalCreate"
					? "sky://terminal/create"
					: "sky://terminal/exit";
			return ((Listener: (Data: unknown) => void) => {
				const Unlisten = (window as any).__TAURI__?.event?.listen(
					Channel,
					(TauriEvent: any) => Listener(TauriEvent.payload),
				);
				return {
					dispose: () => {
						Unlisten?.then((F: () => void) => F());
					},
				};
			}) as unknown as VSCodeEvent<T>;
		}

		// ----------------------------------------------------------------
		// workspaces - onDidChangeWorkspaceFolders
		//
		// Mountain emits `sky://workspaces/changed` with
		// `{ added, removed, folders }` whenever the folder set mutates
		// (BATCH-14 broadcast variant). Wind subscribes so the workbench's
		// workspace service and recent-folders UI see the change the same
		// tick that Cocoon sees its `$deltaWorkspaceFolders` notification.
		// ----------------------------------------------------------------
		if (
			this.ChannelName === "workspaces" &&
			Event === "onDidChangeWorkspaceFolders"
		) {
			return ((Listener: (Data: unknown) => void) => {
				const Unlisten = (window as any).__TAURI__?.event?.listen(
					"sky://workspaces/changed",
					(TauriEvent: any) => Listener(TauriEvent.payload),
				);
				return {
					dispose: () => {
						Unlisten?.then((F: () => void) => F());
					},
				};
			}) as unknown as VSCodeEvent<T>;
		}

		// ----------------------------------------------------------------
		// lifecycle - onWillShutdown
		// ----------------------------------------------------------------
		if (this.ChannelName === "lifecycle" && Event === "onWillShutdown") {
			return ((Listener: (Data: unknown) => void) => {
				const Unlisten = (window as any).__TAURI__?.event?.listen(
					"sky://lifecycle/willShutdown",
					(TauriEvent: any) => Listener(TauriEvent.payload),
				);
				return {
					dispose: () => {
						Unlisten?.then((F: () => void) => F());
					},
				};
			}) as unknown as VSCodeEvent<T>;
		}

		// ----------------------------------------------------------------
		// lifecycle - onDidChangePhase
		// ----------------------------------------------------------------
		if (this.ChannelName === "lifecycle" && Event === "onDidChangePhase") {
			return ((Listener: (Data: unknown) => void) => {
				const Unlisten = (window as any).__TAURI__?.event?.listen(
					"sky://lifecycle/phaseChanged",
					(TauriEvent: any) => Listener(TauriEvent.payload),
				);
				return {
					dispose: () => {
						Unlisten?.then((F: () => void) => F());
					},
				};
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
