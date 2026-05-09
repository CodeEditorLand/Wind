/**
 * @module Function/DevLog
 *
 * Tag-filtered development logging for the browser side.
 *
 * ## Control
 * Set `window.__Trace` in the browser console or pass via config:
 * ```js
 * window.__Trace = "vfs,ipc";   // only VFS + IPC
 * window.__Trace = "all";        // everything
 * window.__Trace = "short";      // everything, compressed + deduped
 * delete window.__Trace;         // off (default)
 * ```
 *
 * Or set `Trace` in localStorage for persistence:
 * ```js
 * localStorage.setItem("Trace", "config,folder");
 * ```
 *
 * ## Short Mode
 *
 * `Trace=short` enables all tags with compression:
 * - Long app-data paths aliased to `$APP`
 * - Consecutive duplicate messages counted (`(x14)` suffix)
 * - Clean single-line output
 *
 * ## Tags - Mountain (Rust) + Wind/Sky (TypeScript)
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

// ── Tag resolution ──────────────────────────────────────────────────────

let CachedTags: string[] | null = null;

let CachedShort: boolean | null = null;

const GetEnabledTags = (): string[] => {
	if (CachedTags !== null) return CachedTags;

	const Raw =
		(window as any).__Trace ??
		(typeof localStorage !== "undefined"
			? localStorage.getItem("Trace")
			: null);

	CachedTags = Raw
		? String(Raw)
				.split(",")
				.map((S: string) => S.trim().toLowerCase())
		: [];

	return CachedTags;
};

const IsShort = (): boolean => {
	if (CachedShort !== null) return CachedShort;

	CachedShort = GetEnabledTags().includes("short");

	return CachedShort;
};

const IsEnabled = (Tag: string): boolean => {
	const Tags = GetEnabledTags();

	if (Tags.length === 0) return false;

	if (IsShort()) return true;

	const Lower = Tag.toLowerCase();

	return Tags.some((T) => T === "all" || T === Lower);
};

// ── Path alias ──────────────────────────────────────────────────────────
// The app-data directory name can be 100+ chars. Alias to $APP.

const AppDataPattern = /land\.editor\.binary\.[^\s/\\)]+/g;

const AliasPath = (Input: string): string =>
	Input.replace(AppDataPattern, "$APP");

// ── Dedup buffer ────────────────────────────────────────────────────────

let DedupKey = "";

let DedupCount = 0;

const FlushDedup = (): void => {
	if (DedupCount > 1) {
		console.log(`  (x${DedupCount})`);
	}

	DedupKey = "";

	DedupCount = 0;
};

// ── Main DevLog function ────────────────────────────────────────────────

/**
 * Tagged development log. Only prints if the tag is enabled.
 *
 * @example
 * DevLog("VFS", "stat", path, result);
 * DevLog("CONFIG", "resolveConfiguration folderUri:", folderUri);
 */
const DevLog = (Tag: string, ...Args: unknown[]): void => {
	if (!IsEnabled(Tag)) return;

	const TagUpper = Tag.toUpperCase();

	if (IsShort()) {
		const Message = Args.map(String).join(" ");

		const Aliased = AliasPath(Message);

		const Key = `${TagUpper}:${Aliased}`;

		if (Key === DedupKey) {
			DedupCount++;

			return;
		}

		FlushDedup();

		DedupKey = Key;

		DedupCount = 1;

		console.log(`[DEV:${TagUpper}]`, Aliased);
	} else {
		console.log(`[DEV:${TagUpper}]`, ...Args);
	}
};

/** Force-reset the cache (call after changing window.__Trace). */
DevLog.reset = () => {
	CachedTags = null;

	CachedShort = null;

	FlushDedup();
};

export default DevLog;
