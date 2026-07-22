/**
 * @module Utility/Tier
 * @description
 * Wind's mirror of Cocoon's `Utility/Tier.ts`. Identical tier set, identical
 * defaults, but values arrive through `import.meta.env.Tier<Capability>`
 * (Vite substitutes them at build time) rather than a Node-side
 * `globalThis.__LandTiers` global.
 *
 * The boot banner goes through `console.info` rather than `LandFixLog` since
 * Wind runs inside the webview where `process` isn't defined.
 *
 * Keep this file synchronised with:
 *   • `Element/Cocoon/Source/Utility/Tier.ts`
 *   • `.env.Land.Sample`
 *   • `Element/Mountain/Source/LandFixTier.rs`
 *
 * See `Documentation/GitHub/Workflow/TierGatedImplementationSelection.md`
 * for the cross-Element propagation workflow.
 */

// Transport tiers ------------------------------------------------------------
export type TierRemoteProcedureCallValue = "gRPC" | "SharedMemory";

export type TierHTTPProxyValue = "HandRolled" | "Hyper";

export type TierLoggerValue = "Standard" | "Ring";

// File-system tiers ----------------------------------------------------------
export type TierFileSystemValue = "Layer2" | "Layer3" | "Layer4";

export type TierFindFilesValue = "Layer3" | "Layer4";

export type TierGlobValue = "JavaScript" | "Native";

export type TierFileWatcherValue = "Stub" | "Layer4";

export type TierSchemeAssetsValue = "Embedded" | "FileSystem" | "Hybrid";

// VS Code API tiers ----------------------------------------------------------
export type TierConfigurationValue = "Cache" | "Eager";

export type TierDiagnosticsValue = "Full" | "Delta";

export type TierClipboardValue = "Layer3" | "Layer4" | "Layer5";

export type TierOpenExternalValue = "Layer3" | "Layer4";

export type TierDocumentMirrorValue = "Full" | "Lazy";

// Lifecycle tiers ------------------------------------------------------------
export type TierExtensionActivationValue =
	"Sequential" | "Parallel4" | "Parallel8" | "Parallel16";

export type TierExtensionScanValue = "Sequential" | "Parallel";

export type TierModuleCacheValue = "Off" | "Simple" | "Shared";

// Telemetry tiers ------------------------------------------------------------
export type TierTelemetryValue = "Synchronous" | "Batched" | "Off";

// IPC routing tiers ----------------------------------------------------------
export type TierIPCValue = "Mountain" | "NodeDeferred" | "Node";

// Per-subsystem routing tiers (added 2026-05-25). Mirror of Cocoon's
// equivalents - keep these synchronized when adding/removing tiers.
export type TierTerminalValue = "Mountain" | "Node";

export type TierSCMValue = "Mountain" | "Node";

export type TierDebugValue = "Mountain" | "Node";

export type TierLanguageFeaturesValue = "Mountain" | "Node";

export type TierSearchValue = "Mountain" | "Node";

export type TierOutputChannelValue = "Mountain" | "Node";

export type TierNativeHostValue = "Mountain" | "Node";

export type TierTreeViewValue = "Mountain" | "Node";

export type TierStorageValue = "Mountain" | "Node";

export type TierModelValue = "Mountain" | "Node";

// `WebSocket` forwards to Cocoon over the Mist WS transport (B7-S6);
// requires TierWebSocket=Mist, falls back to Tauri IPC when disconnected.
export type TierTasksValue = "Mountain" | "Node" | "WebSocket";

export type TierAuthValue = "Mountain" | "Node" | "WebSocket";

export type TierEncryptionValue = "Mountain" | "Node";

export type TierExtensionHostValue = "Process" | "WebWorker" | "Disabled";

export type TierWebSocketValue = "Disabled" | "Mountain" | "Mist";

// Resolution -----------------------------------------------------------------
const EnvMeta = ((import.meta as unknown as { env?: Record<string, string> })
	.env ?? {}) as Record<string, string | undefined>;

const Injected =
	(globalThis as { __LandTiers?: Record<string, unknown> }).__LandTiers ?? {};

const Pick = <T extends string>(Capability: string, Fallback: T): T => {

	const FromInjected = Injected[Capability];

	if (typeof FromInjected === "string" && FromInjected.length > 0) {
		return FromInjected as T;
	}

	const FromEnv = EnvMeta[`Tier${Capability}`];

	if (typeof FromEnv === "string" && FromEnv.length > 0) {
		return FromEnv as T;
	}

	return Fallback;
};

const Tier = {

	RemoteProcedureCall: Pick<TierRemoteProcedureCallValue>(
		"RemoteProcedureCall",

		"gRPC",
	),

	HTTPProxy: Pick<TierHTTPProxyValue>("HTTPProxy", "HandRolled"),

	Logger: Pick<TierLoggerValue>("Logger", "Standard"),

	FileSystem: Pick<TierFileSystemValue>("FileSystem", "Layer2"),

	FindFiles: Pick<TierFindFilesValue>("FindFiles", "Layer3"),

	Glob: Pick<TierGlobValue>("Glob", "JavaScript"),

	FileWatcher: Pick<TierFileWatcherValue>("FileWatcher", "Stub"),

	SchemeAssets: Pick<TierSchemeAssetsValue>("SchemeAssets", "Embedded"),

	Configuration: Pick<TierConfigurationValue>("Configuration", "Cache"),

	Diagnostics: Pick<TierDiagnosticsValue>("Diagnostics", "Full"),

	Clipboard: Pick<TierClipboardValue>("Clipboard", "Layer3"),

	OpenExternal: Pick<TierOpenExternalValue>("OpenExternal", "Layer3"),

	DocumentMirror: Pick<TierDocumentMirrorValue>("DocumentMirror", "Full"),

	ExtensionActivation: Pick<TierExtensionActivationValue>(
		"ExtensionActivation",

		"Parallel8",
	),

	ExtensionScan: Pick<TierExtensionScanValue>("ExtensionScan", "Sequential"),

	ModuleCache: Pick<TierModuleCacheValue>("ModuleCache", "Simple"),

	Telemetry: Pick<TierTelemetryValue>("Telemetry", "Synchronous"),

	// IPC routing: Mountain (default) → NodeDeferred → Node
	IPC: Pick<TierIPCValue>("IPC", "Mountain"),

	// Per-subsystem routing (added 2026-05-25). Defaults match .env.Land
	// and `Mountain/build.rs::EmitTierDefaults`.
	Terminal: Pick<TierTerminalValue>("Terminal", "Mountain"),

	SCM: Pick<TierSCMValue>("SCM", "Mountain"),

	Debug: Pick<TierDebugValue>("Debug", "Mountain"),

	LanguageFeatures: Pick<TierLanguageFeaturesValue>(
		"LanguageFeatures",

		"Mountain",
	),

	Search: Pick<TierSearchValue>("Search", "Mountain"),

	OutputChannel: Pick<TierOutputChannelValue>("OutputChannel", "Mountain"),

	NativeHost: Pick<TierNativeHostValue>("NativeHost", "Mountain"),

	TreeView: Pick<TierTreeViewValue>("TreeView", "Mountain"),

	Storage: Pick<TierStorageValue>("Storage", "Mountain"),

	Model: Pick<TierModelValue>("Model", "Mountain"),

	Tasks: Pick<TierTasksValue>("Tasks", "Node"),

	Auth: Pick<TierAuthValue>("Auth", "Node"),

	Encryption: Pick<TierEncryptionValue>("Encryption", "Mountain"),

	ExtensionHost: Pick<TierExtensionHostValue>("ExtensionHost", "Process"),

	WebSocket: Pick<TierWebSocketValue>("WebSocket", "Disabled"),
} as const;

// One-shot boot banner - visible in browser DevTools.
try {

	// eslint-disable-next-line no-console
	console.info("[LandFix:Tier] Wind tier set resolved:", Tier);
} catch {

	// Ignore - production bundles may strip `console`.
}

export default Tier;
