/**
 * @module Service/StubChannels
 *
 * Static stub responses for VS Code shared-process IPC channels that Land
 * does not implement natively. TauriMainProcessService returns these without
 * a Tauri round-trip, preventing `Unknown method` errors and `undefined`
 * crashes in the workbench.
 *
 * Must be kept in lockstep with the Output copy:
 * Element/Output/Source/Service/TauriMainProcessService.ts
 */

export const StubChannels: Record<string, Record<string, unknown>> = {
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

	// IExternalTerminalService.getDefaultTerminalForPlatforms()
	externalTerminal: {
		getDefaultTerminalForPlatforms: {
			windows: "cmd.exe",

			linux: "/usr/bin/x-terminal-emulator",

			osx: "Terminal.app",
		},
	},

	// IUpdateService - Land has no update server; idle/latest state.
	update: {
		checkForUpdates: { updateType: 0 },

		downloadUpdate: undefined,

		applyUpdate: undefined,

		quitAndInstall: undefined,

		isLatestVersion: true,

		setInternalOrg: undefined,

		_getInitialState: { type: 0 },
	},

	// IWebviewManagerService - Tauri's WKWebView has no Electron menus.
	webview: {
		setIgnoreMenuShortcuts: undefined,

		setContextMenuVisible: undefined,

		hideReference: undefined,

		showReference: undefined,
	},

	// IFileWatcherService - Land routes watching via Mountain's typed API.
	watcher: {
		watch: undefined,

		unwatch: undefined,

		setVerboseLogging: undefined,
	},

	// IURLService - vscode:// deeplink stub.
	urlHandler: {
		registerHandler: undefined,

		open: false,

		create: undefined,
	},

	// IDownloadService - no remote gallery download backend.
	download: { download: undefined },

	// IExtensionTipsService - no exe-based recommendation backend.
	extensionTipsService: {
		getImportantExecutableBasedTips: [],

		getOtherExecutableBasedTips: [],

		getAllWorkspacesTips: [],

		getConfigBasedTips: [],

		getImportantExecutableBasedTipsForExecutable: [],
	},

	// IMcpManagementService - no MCP gallery.
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

	// IUserDataSyncService - sync disabled.
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

	userDataSyncAccount: {
		_getInitialData: undefined,

		getAccount: undefined,
	},

	userDataSyncStoreManagement: { _getInitialData: null },

	userDataAutoSync: {
		triggerSync: undefined,

		turnOn: undefined,

		turnOff: undefined,
	},

	// Language detection - no ML detector in Land.
	languageDetection: {
		detectLanguage: null,

		provideLanguageDetectionHints: { fileExtensions: { extensions: [] } },
	},

	// ITelemetryAppenderChannel - Land routes telemetry via PostHog.
	telemetryAppender: { log: undefined, flush: undefined },

	// MCP gallery manifest - no MCP registry.
	mcpGalleryManifest: { setMcpGalleryManifest: undefined },

	// Extension gallery manifest.
	extensionGalleryManifest: { setExtensionGalleryManifest: undefined },

	// IDiagnosticsService - no shared process.
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

	// Batch 6: medium-priority shared/main-process stubs.
	test: { getResults: [], addResult: undefined, clearResults: undefined },

	profileStorageListener: { onDidChange: undefined },

	checksum: { checksum: "" },

	languagePacks: {
		getAvailableLanguages: [],

		getInstalledLanguages: [],

		getBuiltInExtensionTranslationsUri: undefined,
	},

	userDataSyncUtil: {
		resolveDefaultIgnoredSettings: [],

		resolveUserKeybindings: {},

		resolveFormattingOptions: { eol: "\n", insertSpaces: true, tabSize: 4 },
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

	sharedWebContentExtractor: { readImage: undefined },

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
