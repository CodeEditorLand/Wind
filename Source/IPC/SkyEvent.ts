// ---------------------------------------------------------------------------
// Sky Event Registry - TS mirror of Element/Common/Source/IPC/SkyEvent.rs
// ---------------------------------------------------------------------------
//
// Mountain emits Tauri events on `sky://…` URIs to notify Wind of state
// changes that don't originate from a Wind-initiated `invoke` call. Today
// every Wind listener does `IPCService.events("sky://some/path")` with a
// free-text string; drift between Mountain's emit and Wind's listen is
// invisible until runtime (the listener simply never fires).
//
// This registry is the single source of truth for the 95 event URIs
// Mountain currently emits. Adding a new event:
//   1. Add the entry here AND in `Element/Common/Source/IPC/SkyEvent.rs`.
//   2. Emit from Mountain via `app_handle.emit(SkyEvent::TerminalData.AsStr(),
//      payload)`.
//   3. Subscribe from Wind via `IPCService.events(SkyEvent.TerminalData)`.
//
// Naming convention: `<Prefix><Path>` in PascalCase. Multi-segment paths
// collapse: `sky://tree-view/node-expanded` → `TreeViewNodeExpanded`.
// Acronyms stay UPPERCASE (URL, URI, API, JSON, UUID, CSS, DOM).

export default {
	// --- Configuration ---
	ConfigurationChanged: "sky://configuration/changed",

	// --- Debug ---
	DebugRegister: "sky://debug/register",

	DebugStart: "sky://debug/start",

	DebugStop: "sky://debug/stop",

	// --- Diagnostics ---
	DiagnosticsChanged: "sky://diagnostics/changed",

	// --- Dialog ---
	DialogOpen: "sky://dialog/open",

	DialogSave: "sky://dialog/save",

	// --- Documents ---
	DocumentsOpen: "sky://documents/open",

	DocumentsRenamed: "sky://documents/renamed",

	DocumentsSaved: "sky://documents/saved",

	// --- Decorations ---
	DecorationSetRanges: "sky://decoration/set-ranges",

	// --- Editor ---
	EditorApplyEdits: "sky://editor/applyEdits",

	EditorApplyTextEdits: "sky://editor/apply-text-edits",

	EditorSelectionChanged: "sky://editor/selection-changed",

	EditorActiveChanged: "sky://editor/active-changed",

	EditorOpenDocument: "sky://editor/openDocument",

	EditorSaveAll: "sky://editor/saveAll",

	EditorRevealRange: "sky://editor/revealRange",

	// --- Extensions ---
	ExtensionsInstalled: "sky://extensions/installed",

	ExtensionsUninstalled: "sky://extensions/uninstalled",

	// --- ExtHost ---
	ExtHostDebugClose: "sky://exthost/debug-close",

	ExtHostDebugReload: "sky://exthost/debug-reload",

	// --- Input ---
	InputBoxShow: "sky://input-box/show",

	// --- Language ---
	LanguageConfigure: "sky://language/configure",

	LanguagesSetDocumentLanguage: "sky://languages/setDocumentLanguage",

	// --- Lifecycle ---
	LifecyclePhaseChanged: "sky://lifecycle/phaseChanged",

	LifecycleWillShutdown: "sky://lifecycle/willShutdown",

	// --- Native ---
	NativeOpenExternal: "sky://native/openExternal",

	// --- Notifications ---
	NotificationProgressBegin: "sky://notification/progress-begin",

	NotificationProgressEnd: "sky://notification/progress-end",

	NotificationProgressUpdate: "sky://notification/progress-update",

	NotificationShow: "sky://notification/show",

	// --- Output ---
	OutputAppend: "sky://output/append",

	OutputClear: "sky://output/clear",

	OutputCreate: "sky://output/create",

	OutputDispose: "sky://output/dispose",

	OutputReplace: "sky://output/replace",

	OutputReveal: "sky://output/reveal",

	OutputShow: "sky://output/show",

	// --- Progress ---
	ProgressBegin: "sky://progress/begin",

	ProgressComplete: "sky://progress/complete",

	ProgressEnd: "sky://progress/end",

	ProgressReport: "sky://progress/report",

	ProgressStart: "sky://progress/start",

	ProgressUpdate: "sky://progress/update",

	// --- QuickPick ---
	QuickPickShow: "sky://quickpick/show",

	// --- Source Control ---
	SCMGroupChanged: "sky://scm/group/changed",

	SCMProviderAdded: "sky://scm/provider/added",

	SCMProviderChanged: "sky://scm/provider/changed",

	SCMProviderRemoved: "sky://scm/provider/removed",

	SCMRegister: "sky://scm/register",

	SCMUpdateGroup: "sky://scm/updateGroup",

	// --- Status bar ---
	// Canonical prefix is `sky://statusbar/` (no hyphen). The old
	// `sky://status-bar/message` fork has been collapsed onto
	// `sky://statusbar/set-message`.
	StatusBarCreate: "sky://statusbar/create",

	StatusBarDispose: "sky://statusbar/dispose",

	StatusBarDisposeEntry: "sky://statusbar/dispose-entry",

	StatusBarDisposeMessage: "sky://statusbar/dispose-message",

	StatusBarSetEntry: "sky://statusbar/set-entry",

	StatusBarSetMessage: "sky://statusbar/set-message",

	StatusBarUpdate: "sky://statusbar/update",

	// --- Task ---
	TaskExecute: "sky://task/execute",

	TaskTerminate: "sky://task/terminate",

	// --- Terminal ---
	TerminalClosed: "sky://terminal/closed",

	TerminalCreate: "sky://terminal/create",

	TerminalData: "sky://terminal/data",

	TerminalExit: "sky://terminal/exit",

	TerminalHide: "sky://terminal/hide",

	TerminalOpened: "sky://terminal/opened",

	TerminalProcessId: "sky://terminal/processId",

	TerminalPropertyChanged: "sky://terminal/property-changed",

	TerminalResize: "sky://terminal/resize",

	TerminalShow: "sky://terminal/show",

	// --- Test ---
	TestRegistered: "sky://test/registered",

	TestRunStarted: "sky://test/run-started",

	TestRunStatusChanged: "sky://test/run-status-changed",

	// --- Theme ---
	ThemeChange: "sky://theme/change",

	// --- Tree view ---
	// Canonical prefix is `sky://tree-view/` (kebab-case). The earlier
	// `sky://treeView/register` camelCase fork has been collapsed onto
	// `TreeViewCreate` - a single channel every listener subscribes to.
	TreeViewCreate: "sky://tree-view/create",

	TreeViewDispose: "sky://tree-view/dispose",

	TreeViewNodeExpanded: "sky://tree-view/node-expanded",

	TreeViewRefresh: "sky://tree-view/refresh",

	TreeViewRestoreState: "sky://tree-view/restore-state",

	TreeViewReveal: "sky://tree-view/reveal",

	TreeViewSelectionChanged: "sky://tree-view/selection-changed",

	TreeViewSetBadge: "sky://tree-view/set-badge",

	TreeViewSetMessage: "sky://tree-view/set-message",

	TreeViewSetTitle: "sky://tree-view/set-title",

	// --- UI ---
	UIShowInputBoxRequest: "sky://ui/show-input-box-request",

	UIShowMessageRequest: "sky://ui/show-message-request",

	UIShowQuickPickRequest: "sky://ui/show-quick-pick-request",

	// --- Virtual file system ---
	VFSFileChange: "sky://vfs/fileChange",

	// --- Webview ---
	// Canonical form is kebab-case (`sky://webview/post-message`,
	// `sky://webview/set-html`). The `…CamelCase` aliases existed because
	// Mountain's mod.rs emitted `sky://webview/postMessage` /
	// `sky://webview/setHtml` inline; those emit sites have been migrated
	// to the enum so Sky only ever sees the kebab-case form.
	WebviewCreate: "sky://webview/create",

	WebviewCreated: "sky://webview/created",

	WebviewDispose: "sky://webview/dispose",

	WebviewDisposed: "sky://webview/disposed",

	WebviewMessage: "sky://webview/message",

	WebviewOptionsChanged: "sky://webview/options-changed",

	WebviewPostMessage: "sky://webview/post-message",

	WebviewRevealed: "sky://webview/revealed",

	WebviewSetHTML: "sky://webview/set-html",

	// --- Window ---
	WindowShowTextDocument: "sky://window/showTextDocument",

	// --- Workspace ---
	WorkspaceApplyEdit: "sky://workspace/applyEdit",

	WorkspacesChanged: "sky://workspaces/changed",
} as const satisfies Readonly<Record<string, `sky://${string}`>>;
