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
 * ## Tags
 * - `vfs`       — file stat, read, write, readdir
 * - `ipc`       — TauriMainProcessService channel routing
 * - `config`    — ResolveConfiguration, environment paths
 * - `lifecycle` — preload, polyfills, workbench loading
 * - `storage`   — storage getItems/updateItems
 * - `exthost`   — extension host starter
 * - `folder`    — folder picker, workspace navigation
 * - `bootstrap` — Effect-TS bootstrap stages
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
