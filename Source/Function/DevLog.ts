/**
 * @module Function/DevLog
 *
 * Tag-filtered development logging for the browser side.
 *
 * ## Control
 * Set `window.__LAND_DEV_LOG` in the browser console or pass via config:
 * ```js
 * window.__LAND_DEV_LOG = "vfs,ipc";   // only VFS + IPC
 * window.__LAND_DEV_LOG = "all";        // everything
 * delete window.__LAND_DEV_LOG;         // off (default)
 * ```
 *
 * Or set `LAND_DEV_LOG` in localStorage for persistence:
 * ```js
 * localStorage.setItem("LAND_DEV_LOG", "config,folder");
 * ```
 *
 * ## Tags — Mountain (Rust) + Wind/Sky (TypeScript)
 *
 * | Tag           | Scope                                               |
 * |---------------|-----------------------------------------------------|
 * | `vfs`         | File stat, read, write, readdir, mkdir, delete, copy|
 * | `ipc`         | IPC routing: invoke dispatch, channel calls          |
 * | `config`      | Configuration get/set, env paths, workbench config   |
 * | `lifecycle`   | Startup, shutdown, phases, window events             |
 * | `storage`     | Storage get/set/delete, items, optimize              |
 * | `folder`      | Folder picker, workspace navigation                  |
 * | `exthost`     | Extension host: create, start, kill, exit info       |
 * | `extensions`  | Extension scanning, activation, management           |
 * | `terminal`    | Terminal/PTY: create, sendText, profiles, shell      |
 * | `search`      | Search: findFiles, findInFiles                       |
 * | `themes`      | Theme: list, get active, set                         |
 * | `window`      | Window: focus, maximize, minimize, fullscreen        |
 * | `nativehost`  | OS integration: process, devtools, shell             |
 * | `clipboard`   | Clipboard: read/write text, buffer, image            |
 * | `commands`    | Command registry: execute, getAll                    |
 * | `model`       | Text model: open, close, get, updateContent          |
 * | `output`      | Output channels: create, append, show                |
 * | `notification`| Notifications: show, progress                        |
 * | `progress`    | Progress: begin, end, report                         |
 * | `quickinput`  | Quick input: showQuickPick, showInputBox             |
 * | `workingcopy` | Working copy: dirty state                            |
 * | `workspaces`  | Workspace: folders, recent, enter                    |
 * | `keybinding`  | Keybindings: add, remove, lookup                     |
 * | `label`       | Label service: getBase, getUri                       |
 * | `history`     | Navigation history: push, goBack, goForward          |
 * | `decorations` | Decorations: get, set, clear                         |
 * | `textfile`    | Text file operations: read, write, save              |
 * | `update`      | Update service: check, download, apply               |
 * | `encryption`  | Encryption: encrypt, decrypt                         |
 * | `menubar`     | Menubar updates                                      |
 * | `url`         | URL handler: registerExternalUriOpener               |
 * | `grpc`        | gRPC/Vine: server, client, connections               |
 * | `cocoon`      | Cocoon sidecar: spawn, health, handshake             |
 * | `bootstrap`   | Effect-TS bootstrap stages                           |
 * | `preload`     | Preload: globals, polyfills, ipcRenderer             |
 */

let CachedTags: string[] | null = null;

const GetEnabledTags = (): string[] => {
	if (CachedTags !== null) return CachedTags;
	const Raw =
		(window as any).__LAND_DEV_LOG ??
		(typeof localStorage !== "undefined"
			? localStorage.getItem("LAND_DEV_LOG")
			: null);
	CachedTags = Raw
		? String(Raw)
				.split(",")
				.map((S: string) => S.trim().toLowerCase())
		: [];
	return CachedTags;
};

const IsEnabled = (Tag: string): boolean => {
	const Tags = GetEnabledTags();
	if (Tags.length === 0) return false;
	const Lower = Tag.toLowerCase();
	return Tags.some((T) => T === "all" || T === Lower);
};

/**
 * Tagged development log. Only prints if the tag is enabled.
 *
 * @example
 * DevLog("VFS", "stat", path, result);
 * DevLog("CONFIG", "resolveConfiguration folderUri:", folderUri);
 */
const DevLog = (Tag: string, ...Args: unknown[]): void => {
	if (IsEnabled(Tag)) {
		console.log(`[DEV:${Tag.toUpperCase()}]`, ...Args);
	}
};

/** Force-reset the cache (call after changing window.__LAND_DEV_LOG). */
DevLog.reset = () => {
	CachedTags = null;
};

export default DevLog;
