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

// ── Shim imports ──
import { createInterceptedInvoke } from "../Shim/IPCInterceptor.js";

import { SwallowMap } from "../Shim/SwallowMap.js";

import * as MistWS from "./MistWebSocketTransport.js";

// Inline trace - performance.mark() collected by build-baked OTELBridge.
const _Trace = (Tag: string, Message: string): void => {

	try {
		performance.mark(`land:${Tag}:${Message}`);
	} catch {}
};

// Mirror tagged lines into Mountain's dev-log file sink so
// `Trace=<tag> tail -f Mountain.dev.log` picks up TS-originated
// traffic alongside Rust `dev_log!` output. Fire-and-forget - never
// awaits, never throws. Mountain short-circuits cheaply when the tag
// isn't enabled. Entries buffer for 100ms and flush as a single
// `RenderDevLog` invoke per tag (the Rust command takes one message
// string, so the batch is newline-joined), capped at 20 entries per
// flush window - overflow is dropped and counted in a trailing line.
// One invoke per burst instead of one per error keeps IPC-error
// storms during extension activation from competing with real IPC
// traffic on the Tauri invoke channel. Sends BOTH casings
// (`Tag`/`Message` + `tag`/`message`) so Tauri's param-case handling
// doesn't require a guess - the Rust command coalesces whichever
// arrived populated.
const _DevLogBuffer: Array<{ Tag: string; Message: string }> = [];

let _DevLogDropped = 0;

let _DevLogFlushTimer: ReturnType<typeof setTimeout> | null = null;

const _DevLogFlush = (): void => {

	_DevLogFlushTimer = null;

	const Batch = _DevLogBuffer.splice(0, _DevLogBuffer.length);

	const Dropped = _DevLogDropped;

	_DevLogDropped = 0;

	if (Batch.length === 0) return;

	try {
		const Internals = (window as any).__TAURI_INTERNALS__;

		const Invoke =
			(window as any).__TAURI__?.core?.invoke ??
			(window as any).__TAURI__?.invoke ??
			Internals?.invoke;

		if (typeof Invoke !== "function") return;

		if (Dropped > 0) {
			Batch.push({
				Tag: Batch[Batch.length - 1]?.Tag ?? "channel-stub",

				Message: `(+${Dropped} entries dropped this flush window)`,
			});
		}

		const ByTag = new Map<string, string[]>();

		for (const Entry of Batch) {
			const Lines = ByTag.get(Entry.Tag);

			if (Lines) Lines.push(Entry.Message);

			else ByTag.set(Entry.Tag, [Entry.Message]);
		}

		for (const [Tag, Messages] of ByTag) {
			const Message = Messages.join("\n");

			Invoke("RenderDevLog", {
				Tag,
				Message,
				tag: Tag,
				message: Message,
			}).catch(() => {});
		}
	} catch {}
};

const _DevLogForward = (Tag: string, Message: string): void => {

	if (_DevLogBuffer.length >= 20) {
		_DevLogDropped += 1;
	} else {
		_DevLogBuffer.push({ Tag, Message });
	}

	if (_DevLogFlushTimer === null) {
		_DevLogFlushTimer = setTimeout(_DevLogFlush, 100);
	}
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

	update: "update",

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

	scm: "scm",

	debug: "debug",

	tasks: "tasks",

	auth: "auth",

	language: "language",

	languages: "languages",

	process: "process",

	browserViewGroup: "browserView",

	// `watcher` is VS Code's `IFileWatcherService` channel; its
	// `watch`/`unwatch` methods land on Mountain's `file:watch`/
	// `file:unwatch` arms. `setVerboseLogging` stays stubbed below.
	watcher: "file",

	env: "env",

	history: "history",
};

// `output` deliberately NOT fire-and-forget: Mountain's
// `output:createOutputChannel`/`registerLogger` handlers return handles
// the workbench callers consume, so those calls must round-trip.
const FireAndForgetChannels = new Set(["logger"]);

// Channel-event → `sky://` Tauri event mapping.
//
// Stock VS Code's `Channel.listen("foo")` returns a streaming `Event<T>`
// fed by the channel server. We don't run a channel server - Tauri's
// `app.emit("sky://X", payload)` is the wire substrate. Each channel
// event the workbench subscribes to maps to a `sky://` Tauri event name
// plus an optional `Map` function that reshapes the Tauri payload into
// the shape the renderer-side service expects. Without an entry the
// fallthrough in `listen()` returns a never-firing Event. Keep in
// lockstep with the Output copy at
// `Element/Output/Source/Service/Tauri/Main/Process/Service.ts`.
type ChannelEventBridgeEntry = {

	Channel: string;

	Map?: (Payload: unknown) => unknown;
};

const ChannelEventBridge: Record<
	string,

	Record<string, ChannelEventBridgeEntry>
> = {

	localPty: {
		// VS Code's `IPtyService.onProcessData` expects
		// `{ id: number, event: IProcessDataEvent | string }` per
		// `vs/platform/terminal/common/terminal.ts`. Mountain emits
		// `{ id, data }` from `Environment/TerminalProvider.rs::PTYReader`.
		// Re-key `data` → `event` to match.
		onProcessData: {
			Channel: "sky://terminal/data",

			Map: (P) => {
				const Obj = P as { id?: number; data?: string } | undefined;

				if (!Obj || typeof Obj.id !== "number") return undefined;

				return { id: Obj.id, event: Obj.data ?? "" };
			},
		},

		// Listen on `sky://terminal/create` because that's when Mountain
		// spawns the PTY (same moment the process is "ready" from the
		// renderer's POV - the workbench uses this event to drive xterm
		// MOUNT and start consuming `onProcessData`). The `processId`
		// channel exists separately for extension-host PID notifications
		// from Cocoon - not the same signal.
		onProcessReady: {
			Channel: "sky://terminal/create",

			Map: (P) => {
				const Obj = P as { id?: number; pid?: number } | undefined;

				if (!Obj || typeof Obj.id !== "number") return undefined;

				return {
					id: Obj.id,

					event: {
						pid: Obj.pid ?? 0,

						cwd: "",

						windowsPty: undefined,
					},
				};
			},
		},

		onProcessExit: {
			Channel: "sky://terminal/exit",

			Map: (P) => {
				const Obj = P as { id?: number; code?: number } | undefined;

				if (!Obj || typeof Obj.id !== "number") return undefined;

				return { id: Obj.id, event: Obj.code ?? 0 };
			},
		},
	},

	// Mountain emits `sky://terminal/create` and `sky://terminal/exit`
	// (BATCH-19 Part B). Exposing them on the `terminal` channel as
	// `onTerminalCreate`/`onTerminalExit` lets workbench components
	// (the terminal panel, ITerminalInstanceService) learn about
	// lifecycle transitions without polling.
	terminal: {
		onTerminalData: { Channel: "sky://terminal/data" },

		onTerminalCreate: { Channel: "sky://terminal/create" },

		onTerminalExit: { Channel: "sky://terminal/exit" },
	},

	// Mountain emits `sky://extensions/installed` with
	// `{ identifier, version, location }` (ExtensionInstall.rs +
	// ScanAndPopulateExtensions.rs) and `sky://extensions/uninstalled`
	// with `{ identifier, location }` (ExtensionUninstall.rs) so the
	// Extensions sidebar refreshes without polling `getInstalled`.
	extensions: {
		onDidInstallExtension: { Channel: "sky://extensions/installed" },

		onDidUninstallExtension: { Channel: "sky://extensions/uninstalled" },
	},

	localFilesystem: {
		fileChange: { Channel: "sky://vfs/fileChange" },
	},

	configuration: {
		onDidChangeConfiguration: { Channel: "sky://configuration/changed" },
	},

	// Mountain emits `sky://workspaces/changed` with
	// `{ added, removed, folders }` whenever the folder set mutates
	// (BATCH-14 broadcast variant). Wind subscribes so the workbench's
	// workspace service and recent-folders UI see the change the same
	// tick that Cocoon sees its `$deltaWorkspaceFolders` notification.
	workspaces: {
		onDidChangeWorkspaceFolders: { Channel: "sky://workspaces/changed" },
	},

	lifecycle: {
		onWillShutdown: { Channel: "sky://lifecycle/willShutdown" },

		onDidChangePhase: { Channel: "sky://lifecycle/phaseChanged" },
	},
};

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
		// createWorker must be a settled Promise (not an object wrapping
		// one). The workbench calls .then() directly on the return value;
		// wrapping in { onDidTerminate } made it a non-thenable causing a
		// silent hang in DiskFileSystemProvider, and a never-settling
		// Promise hangs language-detection service init.
		createWorker: Promise.resolve(undefined),

		disposeWorker: undefined,
	},

	meteredConnection: {},

	webContentExtractor: {},

	browserElements: {},

	NativeMcpDiscoveryHelper: { load: undefined },

	sandboxHelper: {},

	mcpGateway: {},

	browserViewGroup: {
		getBrowserViews: [],
	},

	// Fix: terminals.windows - IExternalTerminalService.getDefaultTerminalForPlatforms()
	externalTerminal: {
		getDefaultTerminalForPlatforms: {
			windows: "cmd.exe",

			linux: "/usr/bin/x-terminal-emulator",

			osx: "Terminal.app",
		},
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

	// `watcher` - `IFileWatcherService`. `watch`/`unwatch` route to
	// Mountain through the `watcher: "file"` ChannelRouteMap entry;
	// only the logging toggle is a no-op.
	watcher: {
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
// Tier gate - dual-track IPC routing
// ============================================================================

// `TierIPC` values (from .env.Land via turbo globalEnv):
//   "Mountain"     (default) - all calls go to Mountain/Tauri IPC
//   "NodeDeferred" - Mountain first; fall through to Cocoon on undefined/miss
//   "Node"         - all calls go to Cocoon via cocoon:request (pure Node.js)
const _TierIPC: string =
	(import.meta as any).env?.TierIPC ??
	((globalThis as { __LandTiers?: Record<string, unknown> }).__LandTiers?.[
		"TierIPC"
	] as string | undefined) ??
	"Mountain";

// Per-subsystem tier resolution (added 2026-05-25 - TIER-SYSTEM Step 4b).
// Each subsystem can independently route to Mountain or Node. When the
// resolved per-subsystem tier is "Node", the call bypasses Mountain even
// when `_TierIPC === "Mountain"`. Falls back to `_TierIPC` for prefixes
// without a per-subsystem tier mapping. Keep in lockstep with the Output
// copy at `Element/Output/Source/Service/Tauri/Main/Process/Service.ts`.
function _ReadTier(Name: string): string | undefined {

	const FromEnv = (import.meta as any).env?.[`Tier${Name}`] as
		string | undefined;

	if (FromEnv !== undefined) return FromEnv;

	const FromGlobal = (globalThis as { __LandTiers?: Record<string, unknown> })
		.__LandTiers?.[`Tier${Name}`];

	return typeof FromGlobal === "string" ? FromGlobal : undefined;
}

const _TierTerminal = _ReadTier("Terminal") ?? "Mountain";

const _TierSCM = _ReadTier("SCM") ?? "Mountain";

const _TierDebug = _ReadTier("Debug") ?? "Mountain";

const _TierLanguageFeatures = _ReadTier("LanguageFeatures") ?? "Mountain";

const _TierSearch = _ReadTier("Search") ?? "Mountain";

const _TierOutputChannel = _ReadTier("OutputChannel") ?? "Mountain";

const _TierNativeHost = _ReadTier("NativeHost") ?? "Mountain";

const _TierTreeView = _ReadTier("TreeView") ?? "Mountain";

const _TierStorage = _ReadTier("Storage") ?? "Mountain";

const _TierModel = _ReadTier("Model") ?? "Mountain";

const _TierTasks = _ReadTier("Tasks") ?? "Node";

const _TierAuth = _ReadTier("Auth") ?? "Node";

const _TierWebSocket: string = _ReadTier("WebSocket") ?? "Disabled";

const _TierEncryption = _ReadTier("Encryption") ?? "Mountain";

// Map RoutePrefix → effective tier. Mirrors the Mountain-side dispatch in
// `Element/Mountain/Source/IPC/WindServiceHandlers/mod.rs` so per-channel
// routing stays bidirectional. RoutePrefix values come from
// `ChannelRouteMap` above.
function _ResolveTierForRoute(RoutePrefix: string | null): string {

	if (!RoutePrefix) return _TierIPC;

	switch (RoutePrefix) {
		case "terminal":
		case "localPty":
			return _TierTerminal;

		case "git":
			return _TierSCM;

		case "extensionhostdebugservice":
		case "extensionHostStarter":
			return _TierDebug;

		case "language":
		case "languages":
			return _TierLanguageFeatures;

		case "search":
			return _TierSearch;

		case "output":
			return _TierOutputChannel;

		case "nativeHost":
			return _TierNativeHost;

		case "tree":
			return _TierTreeView;

		case "storage":
			return _TierStorage;

		case "model":
		case "textFile":
		case "file":
			return _TierModel;

		case "tasks":
			return _TierTasks;

		case "auth":
			return _TierAuth;

		case "encryption":
			return _TierEncryption;

		default:
			return _TierIPC;
	}
}

// Forward a call to Cocoon's Node.js runtime via Mountain's `cocoon:request`
// bridge. Mountain relays the call over gRPC to Cocoon, which owns the
// Node.js implementation (extension host namespaces, workspace state, etc.).
// Returns undefined when the Tauri invoke channel is unavailable (non-Tauri env).
async function _InvokeViaNode(
	Method: string,

	Params: unknown[],
): Promise<unknown> {

	const Invoke =
		(window as any).__TAURI__?.core?.invoke ??
		(window as any).__TAURI__?.invoke;

	if (typeof Invoke !== "function") return undefined;

	// Shim: wrap invoke through IPCInterceptor for TierShim gate.
	const invoke = createInterceptedInvoke(Invoke);

	try {
		return await invoke("MountainIPCInvoke", {
			method: "cocoon:request",
			params: [Method, Params.length === 1 ? Params[0] : Params],
		});
	} catch {
		return undefined;
	}
}

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

	// Shim: wrap invoke through IPCInterceptor for TierShim gate.
	// When TierShim is None the interceptor is a no-op passthrough;
	// esbuild dead-code-eliminates the wrapping when TierShim=None.
	const invoke = createInterceptedInvoke(Invoke);

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
		return await invoke("MountainIPCInvoke", {
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

		// A stub entry only answers for the commands it names explicitly.
		// Commands absent from the stub object fall through to
		// ChannelRouteMap routing (or the `miss` forward below), so a
		// partially-stubbed channel like `process` still reaches
		// Mountain's real handlers for its non-stubbed methods.
		// Stub resolution precedes BOTH the per-route tier dispatch and
		// the Node-tier cocoon:request fallback below - a stub-listed
		// command is answered locally and never reaches Cocoon,
		// regardless of TierIPC.
		if (
			Stubs !== undefined &&
			Object.prototype.hasOwnProperty.call(Stubs, Command)
		) {
			_Trace("ipc", `stub:${this.ChannelName}.${Command}`);

			const StubValue = Stubs[Command];

			return (StubValue !== undefined ? StubValue : undefined) as T;
		}

		if (this.RoutePrefix) {
			const MountainMethod = `${this.RoutePrefix}:${Command}`;

			const Params =
				Arg !== undefined ? (Array.isArray(Arg) ? Arg : [Arg]) : [];

			// Per-subsystem Node track: bypass Mountain entirely and route
			// straight to Cocoon. Triggered when either the global `_TierIPC`
			// or the per-subsystem tier for this RoutePrefix resolves to
			// "Node" (TIER-SYSTEM Step 4b).
			const _EffectiveTier = _ResolveTierForRoute(this.RoutePrefix);

			if (_EffectiveTier === "WebSocket" && MistWS.IsAvailable()) {
				try {
					return (await MistWS.invoke(MountainMethod, Params)) as T;
				} catch (WSError) {
					// Global Node tier: a Mountain re-dispatch would
					// violate the Node-only contract - propagate.
					if (_TierIPC === "Node") {
						_Trace("mist-ws", `error:${MountainMethod}`);

						throw WSError;
					}

					// Otherwise the call re-dispatches to Mountain below -
					// trace so the double-dispatch is visible.
					_Trace("mist-ws", `fallback-to-mountain:${MountainMethod}`);
				}
			}

			if (_EffectiveTier === "Node") {
				try {
					return (await _InvokeViaNode(MountainMethod, Params)) as T;
				} catch {
					return undefined as T;
				}
			}

			try {
				const Result = await _TimedTrace("ipc", MountainMethod, () =>
					InvokeMountain(MountainMethod, Params),
				);

				// NodeDeferred: Mountain answered but had no handler
				// (strictly `undefined` - `null` is a legitimate Mountain
				// result and must NOT fall back). Fall through to Cocoon.
				if (Result === undefined && _EffectiveTier === "NodeDeferred") {
					_Trace("ipc", `nodeDeferred:${MountainMethod}`);

					return (await _InvokeViaNode(MountainMethod, Params)) as T;
				}

				if (
					FileSystemChannels.has(this.ChannelName) &&
					(Command === "readFile" || Command === "read")
				) {
					const Raw = Result as
						| { buffer: number[]; bytesRead?: number }

						| number[]
						| null
						| undefined;

					if (Raw !== null && Raw !== undefined) {
						const Arr = Array.isArray(Raw)

							? Raw
							: (Raw as { buffer: number[] }).buffer;

						if (Array.isArray(Arr)) {
							const Bytes = new Uint8Array(Arr);

							// fd-based `read` (DiskFileSystemProviderClient.read)
							// destructures a `[VSBuffer, bytesRead]` tuple and
							// copies `bytes.buffer.slice(0, bytesRead)` into its
							// own buffer. `readFile` destructures `{ buffer }`.
							if (Command === "read") {
								const BytesRead =
									!Array.isArray(Raw) &&
									typeof Raw.bytesRead === "number"
										? Raw.bytesRead
										: Bytes.byteLength;

								return [
									{
										buffer: Bytes,

										byteLength: Bytes.byteLength,
									},

									BytesRead,
								] as unknown as T;
							}

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

				// NodeDeferred: a Mountain error counts as a miss -
				// fall through to Cocoon instead of surfacing it.
				if (_EffectiveTier === "NodeDeferred") {
					_Trace("ipc", `nodeDeferred:${MountainMethod}`);

					return (await _InvokeViaNode(MountainMethod, Params)) as T;
				}

				// Rethrow so callers expecting concrete shapes (arrays,
				// tuples) see a rejected promise instead of `undefined`
				// seeping into `.map`/`.forEach`. The workbench's channel
				// clients handle rejection; known undefined-intolerant
				// callers are covered by StubChannels above.
				throw RawError;
			}
		}

		// NodeDeferred: no Mountain route, no stub, but Cocoon may have a
		// handler. Forward through the cocoon:request bridge so the Node.js
		// extension host can service it. Returns undefined when unavailable.
		// Also honours per-subsystem tiers so e.g. `tasks` / `auth` channels
		// (whose defaults are "Node") attempt the Cocoon path even when the
		// global `_TierIPC` is "Mountain" (TIER-SYSTEM Step 4b).
		const _NoRouteTier = _ResolveTierForRoute(this.ChannelName);

		if (
			_TierIPC === "NodeDeferred" ||
			_TierIPC === "Node" ||
			_NoRouteTier === "Node" ||
			_NoRouteTier === "NodeDeferred"
		) {
			const NodeMethod = `${this.ChannelName}:${Command}`;

			const NodeParams =
				Arg !== undefined ? (Array.isArray(Arg) ? Arg : [Arg]) : [];

			try {
				return (await _InvokeViaNode(NodeMethod, NodeParams)) as T;
			} catch {
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

		// Channel-event subscriptions that route through Tauri's event
		// system - see `ChannelEventBridge` above. The `Disposed` flag
		// makes a dispose() issued BEFORE the async `listen()` resolves
		// still unhook deterministically: the resolution callback checks
		// the flag and immediately unlistens instead of leaking the
		// subscription.
		const SkyEventBridge = ChannelEventBridge[this.ChannelName]?.[Event];

		if (SkyEventBridge) {
			return ((Listener: (Payload: unknown) => void) => {
				let Disposed = false;

				let Unlisten: (() => void) | null = null;

				import("@tauri-apps/api/event")
					.then(({ listen }) => {
						if (Disposed) return;

						return listen(SkyEventBridge.Channel, (TauriEvent) => {
							const Mapped = SkyEventBridge.Map
								? SkyEventBridge.Map(TauriEvent.payload)

								: TauriEvent.payload;

							if (Mapped !== undefined) Listener(Mapped);
						});
					})
					.then((Result) => {
						if (typeof Result === "function") {
							if (Disposed) Result();

							else Unlisten = Result;
						}
					})
					.catch(() => {});

				return {
					dispose: () => {
						Disposed = true;

						Unlisten?.();
					},
				};
			}) as unknown as VSCodeEvent<T>;
		}

		if (
			FileSystemChannels.has(this.ChannelName) &&
			Event === "readFileStream"
		) {
			return ((Listener: (DataOrErrorOrEnd: unknown) => void) => {
				const Params =
					Arg !== undefined ? (Array.isArray(Arg) ? Arg : [Arg]) : [];

				// `DiskFileSystemProviderClient` discriminates data chunks
				// from errors via `instanceof VSBuffer`, so the wrap MUST
				// use the workbench's own class from `__CEL_SERVICES__` -
				// a separately-imported module copy fails the instanceof
				// and every chunk lands in the error branch ("Unknown
				// (FileSystemError)"), killing every editor file open.
				const ResolveVSBuffer = async (): Promise<{
					wrap(buffer: Uint8Array): unknown;
				}> => {
					const Exposed = (globalThis as any).__CEL_SERVICES__
						?.VSBuffer;

					if (Exposed?.wrap) return Exposed;

					// @ts-expect-error - no type declarations for the runtime VS Code module
					const Module =
						(await import("../../../base/common/buffer.js")) as {
							VSBuffer: { wrap(buffer: Uint8Array): unknown };
						};

					return Module.VSBuffer;
				};

				Promise.all([
					ResolveVSBuffer(),

					InvokeMountain(`${this.RoutePrefix}:readFile`, Params),
				])
					.then(([VSBuffer, Result]) => {
						const Raw = Result as
							{ buffer: number[] } | number[] | null | undefined;

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

		// ── Shim activation — gated behind TierShim ──
		if (process.env["TierShim"] && process.env["TierShim"] !== "None") {
			// Load SwallowMap defaults synchronously — must precede
			// any IPCInterceptor.decide() calls so rules are in place.
			SwallowMap.loadDefaults();

			// Async shim modules — activate DOM event interception,
			// network proxy, and async scheduling proxy.
			import("../Shim/EventInterceptor.js").then((m) => m.default?.());

			import("../Shim/NetworkProxy.js").then((m) => m.default?.());

			import("../Shim/AsyncProxy.js").then((m) => m.default?.());
		}
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

export function InitializeWebSocket(port: number, secret: string): void {

	MistWS.Initialize(port, secret);
}

export default TauriMainProcessService;
