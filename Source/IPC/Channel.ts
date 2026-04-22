// ---------------------------------------------------------------------------
// IPC Channel Registry — TS mirror of Element/Common/Source/IPC/Channel.rs
// ---------------------------------------------------------------------------
//
// Every Wind-side `IPCService.invoke(...)` picks its wire string from this
// object. The Rust `Channel` enum in Common is the authoritative source; this
// file is hand-kept in lockstep. Ordering and wire strings must match exactly
// — a `grep "=>" Channel.rs | wc -l` and a `grep ":" Channel.ts | wc -l`
// should agree, and both should equal the live Mountain dispatch count.
//
// Type-safe consumption pattern:
//
//   import type Channel from "./Channel.js";
//   const { default: Channels } = await import("./Channel.js");
//   IPCService.invoke(Channels.ExtensionsInstall)([VsixPath]);
//
// The `as const satisfies …` tail ensures TypeScript surfaces literal string
// types (so a typo at the call site fails to compile) AND that every entry is
// a valid wire string, without requiring a separate type export.

export default {
	// --- Cocoon bridge ---
	CocoonExtensionHostMessage: "cocoon:extensionHostMessage",

	// --- Commands ---
	CommandsExecute: "commands:execute",
	CommandsGetAll: "commands:getAll",

	// --- Configuration ---
	ConfigurationGet: "configuration:get",
	ConfigurationUpdate: "configuration:update",

	// --- Decorations ---
	DecorationsClear: "decorations:clear",
	DecorationsGet: "decorations:get",
	DecorationsGetMany: "decorations:getMany",
	DecorationsSet: "decorations:set",

	// --- Diagnostics ---
	DiagnosticLog: "diagnostic:log",

	// --- Encryption ---
	EncryptionDecrypt: "encryption:decrypt",
	EncryptionEncrypt: "encryption:encrypt",

	// --- Environment ---
	EnvironmentGet: "environment:get",

	// --- Extension host debug service ---
	ExtensionHostDebugServiceAttachSession:
		"extensionhostdebugservice:attachSession",
	ExtensionHostDebugServiceClose: "extensionhostdebugservice:close",
	ExtensionHostDebugServiceReload: "extensionhostdebugservice:reload",
	ExtensionHostDebugServiceTerminateSession:
		"extensionhostdebugservice:terminateSession",

	// --- Extensions ---
	ExtensionsGet: "extensions:get",
	ExtensionsGetAll: "extensions:getAll",
	ExtensionsGetExtensions: "extensions:getExtensions",
	ExtensionsGetExtensionsControlManifest:
		"extensions:getExtensionsControlManifest",
	ExtensionsGetInstalled: "extensions:getInstalled",
	ExtensionsGetRecommendations: "extensions:getRecommendations",
	ExtensionsGetUninstalled: "extensions:getUninstalled",
	ExtensionsInstall: "extensions:install",
	ExtensionsIsActive: "extensions:isActive",
	ExtensionsQuery: "extensions:query",
	ExtensionsReinstall: "extensions:reinstall",
	ExtensionsScanSystemExtensions: "extensions:scanSystemExtensions",
	ExtensionsScanUserExtensions: "extensions:scanUserExtensions",
	ExtensionsUninstall: "extensions:uninstall",
	ExtensionsUpdateMetadata: "extensions:updateMetadata",

	// --- File system ---
	FileCloneFile: "file:cloneFile",
	FileClose: "file:close",
	FileCopy: "file:copy",
	FileDelete: "file:delete",
	FileExists: "file:exists",
	FileMkdir: "file:mkdir",
	FileMove: "file:move",
	FileOpen: "file:open",
	FileRead: "file:read",
	FileReadBinary: "file:readBinary",
	FileReaddir: "file:readdir",
	FileReadFile: "file:readFile",
	FileRealpath: "file:realpath",
	FileRename: "file:rename",
	FileStat: "file:stat",
	FileUnwatch: "file:unwatch",
	FileWatch: "file:watch",
	FileWrite: "file:write",
	FileWriteBinary: "file:writeBinary",
	FileWriteFile: "file:writeFile",

	// --- History ---
	HistoryCanGoBack: "history:canGoBack",
	HistoryCanGoForward: "history:canGoForward",
	HistoryClear: "history:clear",
	HistoryGetStack: "history:getStack",
	HistoryGoBack: "history:goBack",
	HistoryGoForward: "history:goForward",
	HistoryPush: "history:push",

	// --- Keybindings ---
	KeybindingAdd: "keybinding:add",
	KeybindingGetAll: "keybinding:getAll",
	KeybindingLookup: "keybinding:lookup",
	KeybindingRemove: "keybinding:remove",

	// --- Labels ---
	LabelGetBase: "label:getBase",
	LabelGetURI: "label:getUri",
	LabelGetWorkspace: "label:getWorkspace",

	// --- Lifecycle ---
	LifecycleAdvancePhase: "lifecycle:advancePhase",
	LifecycleGetPhase: "lifecycle:getPhase",
	LifecycleRequestShutdown: "lifecycle:requestShutdown",
	LifecycleSetPhase: "lifecycle:setPhase",
	LifecycleWhenPhase: "lifecycle:whenPhase",

	// --- Log (legacy / short) ---
	LogCreateLogger: "log:createLogger",
	LogRegisterLogger: "log:registerLogger",

	// --- Logger (current) ---
	LoggerCreateLogger: "logger:createLogger",
	LoggerCritical: "logger:critical",
	LoggerDebug: "logger:debug",
	LoggerDeregisterLogger: "logger:deregisterLogger",
	LoggerError: "logger:error",
	LoggerFlush: "logger:flush",
	LoggerGetLevel: "logger:getLevel",
	LoggerGetRegisteredLoggers: "logger:getRegisteredLoggers",
	LoggerInfo: "logger:info",
	LoggerLog: "logger:log",
	LoggerRegisterLogger: "logger:registerLogger",
	LoggerSetLevel: "logger:setLevel",
	LoggerSetVisibility: "logger:setVisibility",
	LoggerTrace: "logger:trace",
	LoggerWarn: "logger:warn",

	// --- Menubar ---
	MenubarUpdateMenubar: "menubar:updateMenubar",

	// --- Model ---
	ModelClose: "model:close",
	ModelGet: "model:get",
	ModelGetAll: "model:getAll",
	ModelOpen: "model:open",
	ModelUpdateContent: "model:updateContent",

	// --- Native host ---
	NativeOpenExternal: "native:openExternal",
	NativeShowItemInFolder: "native:showItemInFolder",

	// --- Notifications ---
	NotificationEndProgress: "notification:endProgress",
	NotificationShow: "notification:show",
	NotificationShowProgress: "notification:showProgress",
	NotificationUpdateProgress: "notification:updateProgress",

	// --- Output channel ---
	OutputAppend: "output:append",
	OutputAppendLine: "output:appendLine",
	OutputClear: "output:clear",
	OutputCreate: "output:create",
	OutputShow: "output:show",

	// --- Progress ---
	ProgressBegin: "progress:begin",
	ProgressEnd: "progress:end",
	ProgressReport: "progress:report",

	// --- Search ---
	SearchFindFiles: "search:findFiles",
	SearchFindInFiles: "search:findInFiles",

	// --- Storage ---
	StorageClose: "storage:close",
	StorageDelete: "storage:delete",
	StorageGet: "storage:get",
	StorageGetItems: "storage:getItems",
	StorageIsUsed: "storage:isUsed",
	StorageKeys: "storage:keys",
	StorageOptimize: "storage:optimize",
	StorageSet: "storage:set",
	StorageUpdateItems: "storage:updateItems",

	// --- QuickInput (vscode.window.showQuickPick / showInputBox) ---
	QuickInputShowInputBox: "quickInput:showInputBox",
	QuickInputShowQuickPick: "quickInput:showQuickPick",

	// --- TextFile (editor working-copy surface) ---
	TextFileRead: "textFile:read",
	TextFileWrite: "textFile:write",
	TextFileSave: "textFile:save",

	// --- WorkingCopy (dirty-state tracking) ---
	WorkingCopyGetAllDirty: "workingCopy:getAllDirty",
	WorkingCopyGetDirtyCount: "workingCopy:getDirtyCount",
	WorkingCopyIsDirty: "workingCopy:isDirty",
	WorkingCopySetDirty: "workingCopy:setDirty",

	// --- Terminal ---
	TerminalCreate: "terminal:create",
	TerminalDispose: "terminal:dispose",
	TerminalHide: "terminal:hide",
	TerminalSendText: "terminal:sendText",
	TerminalShow: "terminal:show",

	// --- Themes ---
	ThemesGetActive: "themes:getActive",
	ThemesList: "themes:list",
	ThemesSet: "themes:set",

	// --- Update ---
	UpdateApplyUpdate: "update:applyUpdate",
	UpdateCheckForUpdates: "update:checkForUpdates",
	UpdateDownloadUpdate: "update:downloadUpdate",
	UpdateIsLatestVersion: "update:isLatestVersion",
	UpdateQuitAndInstall: "update:quitAndInstall",

	// --- URL handlers ---
	URLRegisterExternalURIOpener: "url:registerExternalUriOpener",

	// --- Workbench ---
	WorkbenchGetConfiguration: "workbench:getConfiguration",

	// --- Workspaces ---
	WorkspacesAddFolder: "workspaces:addFolder",
	WorkspacesAddRecentlyOpened: "workspaces:addRecentlyOpened",
	WorkspacesClearRecentlyOpened: "workspaces:clearRecentlyOpened",
	WorkspacesCreateUntitledWorkspace: "workspaces:createUntitledWorkspace",
	WorkspacesDeleteUntitledWorkspace: "workspaces:deleteUntitledWorkspace",
	WorkspacesEnterWorkspace: "workspaces:enterWorkspace",
	WorkspacesGetDirtyWorkspaces: "workspaces:getDirtyWorkspaces",
	WorkspacesGetFolders: "workspaces:getFolders",
	WorkspacesGetName: "workspaces:getName",
	WorkspacesGetRecentlyOpened: "workspaces:getRecentlyOpened",
	WorkspacesGetWorkspaceIdentifier: "workspaces:getWorkspaceIdentifier",
	WorkspacesRemoveFolder: "workspaces:removeFolder",
	WorkspacesRemoveRecentlyOpened: "workspaces:removeRecentlyOpened",
} as const satisfies Readonly<Record<string, `${string}:${string}`>>;
