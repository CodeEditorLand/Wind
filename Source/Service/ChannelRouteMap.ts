/**
 * @module Service/ChannelRouteMap
 *
 * Maps VS Code IPC channel names to Mountain `method:` prefix strings.
 * Used by TauriChannel.call() to construct the `method:commandName` key
 * that Mountain's WindServiceHandlers dispatch table expects.
 *
 * Must be kept in lockstep with the Output copy:
 * Element/Output/Source/Service/TauriMainProcessService.ts
 */

/** Channel → Mountain route-prefix map. */
export const ChannelRouteMap: Record<string, string> = {
	localFilesystem: "file",

	storage: "storage",

	logger: "logger",

	configuration: "configuration",

	textFile: "textFile",

	extensions: "extensions",

	// Both extension sidebar channels map to Mountain's extensions:* handlers.
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

	url: "url",

	menubar: "menubar",

	encryption: "encryption",

	extensionHostStarter: "extensionHostStarter",

	extensionhostdebugservice: "extensionhostdebugservice",

	// Built-in git extension routes `git.*` → Mountain subprocess handlers.
	localGit: "git",
};

/** Channels where failures are silently swallowed (fire-and-forget). */
export const FireAndForgetChannels = new Set(["logger", "output"]);

/** Channels whose errors should propagate as typed FileSystem errors. */
export const FileSystemChannels = new Set(["localFilesystem"]);

/** Commands inside FileSystemChannels that should throw on error. */
export const FileSystemThrowCommands = new Set([
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
