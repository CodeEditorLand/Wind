import { CreateIPCRenderer as i } from "./CreateIPCRenderer.js";
import { CreateProcess as t } from "./CreateProcess.js";
import { Fallback as d } from "./Fallback.js";
import { ResolveConfiguration as s } from "./ResolveConfiguration.js";

async function c() {
	try {
		if (typeof window > "u") {
			const n = new Error(
				"Cannot install Wind polyfill: window is not defined",
			);
			console.error(n);
			return;
		}
		if (window.polyfillInstalled) return;
		((window.polyfillInstalled = !0),
			console.log("[Wind] Starting Wind preload installation..."));
		const o = await s(),
			e = i(),
			l = t(o),
			r = { ipcRenderer: e, process: l, configuration: o };
		((window.preloadGlobals = r),
			console.log("[Wind] preloadGlobals attached to window"));
		const a = {
			ipcRenderer: e,
			process: l,
			context: {
				configuration: () => o,
				resolveConfiguration: async () => o,
			},
			webFrame: { setZoomLevel: () => {} },
			webUtils: { getPathForFile: (n) => n.name },
			ipcMessagePort: { acquire: () => {} },
		};
		((window.vscode = a),
			console.info(
				"[Wind] Successfully installed Electron API polyfill for workbench.",
			),
			(window.__WIND_PRELOAD_READY__ = !0),
			console.log(
				"[Wind] Preload ready, Effect-TS bootstrap can proceed",
			));
	} catch (o) {
		(console.error("[Wind] Install error:", o), d());
	}
}
export { c as default };
