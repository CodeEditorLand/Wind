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
export type TierRemoteProcedureCallValue = "GRPC" | "SharedMemory";
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
	| "Sequential"
	| "Parallel4"
	| "Parallel8"
	| "Parallel16";
export type TierExtensionScanValue = "Sequential" | "Parallel";
export type TierModuleCacheValue = "Off" | "Simple" | "Shared";

// Telemetry tiers ------------------------------------------------------------
export type TierTelemetryValue = "Synchronous" | "Batched" | "Off";

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
		"GRPC",
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
} as const;

// One-shot boot banner - visible in browser DevTools.
try {
	// eslint-disable-next-line no-console
	console.info("[LandFix:Tier] Wind tier set resolved:", Tier);
} catch {
	// Ignore - production bundles may strip `console`.
}

export default Tier;
