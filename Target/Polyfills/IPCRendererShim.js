async function l(r, e = {}) {
	try {
		const n = window.__TAURI__ ?? window.TAURI;
		if (typeof n?.invoke == "function") return await n.invoke(r, e);
		throw new Error(`Tauri invoke not available for command: ${r}`);
	} catch (n) {
		throw (
			console.error(`[IPCRendererShim] Tauri invoke failed for ${r}:`, n),
			n
		);
	}
}
function c(r, e = {}) {
	try {
		const n = window.__TAURI__ ?? window.TAURI;
		typeof n?.invoke == "function"
			? n.invoke(r, e).catch((t) => {
					console.warn(
						`[IPCRendererShim] Tauri send failed (no response expected): ${r}`,
						t,
					);
				})
			: console.warn(`[IPCRendererShim] Tauri not available for: ${r}`);
	} catch (n) {
		console.warn(
			`[IPCRendererShim] Tauri send error (no response expected): ${r}`,
			n,
		);
	}
}
const u = [
	{
		electronPattern: /^logger:(log|warn|error|info|debug|trace|critical)$/,
		tauriCommand: "logger:log",
		transform: (r) => ({ level: r[0], message: r[1], context: r[2] }),
	},
	{
		electronPattern: /^policy:(get|set|validate|enforce|check)$/,
		tauriCommand: "policy:handle",
		transform: (r) => ({ action: r[0], data: r[1] }),
	},
	{
		electronPattern: /^sign:(sign|verify|generate|validate)$/,
		tauriCommand: "sign:handle",
		transform: (r) => ({ action: r[0], data: r[1], options: r[2] }),
	},
	{
		electronPattern: /^userDataProfiles:(create|delete|update|get|list)$/,
		tauriCommand: "user_data:handle_profile",
		transform: (r) => ({ action: r[0], profileId: r[1], data: r[2] }),
	},
	{
		electronPattern:
			/^localFileSystem:(read|write|delete|exists|stat|readdir)$/,
		tauriCommand: "file:handle",
		transform: (r) => ({ action: r[0], path: r[1], data: r[2] }),
	},
];
function p(r) {
	for (const e of u)
		if (e.electronPattern.test(r)) {
			const n = e.transform?.([]) ?? {};
			return { command: e.tauriCommand, args: n };
		}
	return null;
}
function R(r, e) {
	for (const n of u)
		if (n.electronPattern.test(r) && n.transform) return n.transform(e);
	return { args: e };
}
class g {
	listeners = new Map();
	replyHandlers = new Map();
	replyCounter = 0;
	onceListeners = new Map();
	send(e, ...n) {
		console.log(`[IPCRendererShim] send: ${e}`, n);
		const t = p(e);
		if (t) {
			const o = R(e, n);
			c(t.command, o);
		} else c("ipc:send", { channel: e, args: n });
	}
	sendSync(e, ...n) {
		console.warn(
			"[IPCRendererShim]\u2001\u26A0\uFE0F sendSync is not supported in Tauri. Use invoke() instead. Returning undefined.",
		);
	}
	async invoke(e, ...n) {
		console.log(`[IPCRendererShim] invoke: ${e}`, n);
		const t = p(e);
		if (t) {
			const o = R(e, n);
			return await l(t.command, o);
		}
		return await l("ipc:invoke", { channel: e, args: n });
	}
	on(e, n) {
		return (
			console.log(`[IPCRendererShim] on: ${e}`),
			this.listeners.has(e) || this.listeners.set(e, new Set()),
			this.listeners.get(e).add(n),
			this.registerTauriListener(e, n),
			this
		);
	}
	once(e, n) {
		(console.log(`[IPCRendererShim] once: ${e}`),
			this.onceListeners.has(e) || this.onceListeners.set(e, new Set()),
			this.onceListeners.get(e).add(new WeakRef(n)));
		const t = (o, ...a) => {
			(n(o, ...a), this.removeListener(e, t));
		};
		return (this.on(e, t), this);
	}
	removeListener(e, n) {
		console.log(`[IPCRendererShim] removeListener: ${e}`);
		const t = this.listeners.get(e);
		return (
			t && (t.delete(n), t.size === 0 && this.listeners.delete(e)),
			this
		);
	}
	removeAllListeners(e) {
		return (
			console.log(`[IPCRendererShim] removeAllListeners: ${e ?? "all"}`),
			e ? this.listeners.delete(e) : this.listeners.clear(),
			this
		);
	}
	sendTo(e, n, t) {
		console.log(`[IPCRendererShim] sendTo: ${e}`);
		const o = ++this.replyCounter,
			a = { channel: e, args: n, callback: t, timestamp: Date.now() };
		(this.replyHandlers.set(o, a),
			this.invoke(e, ...n)
				.then((s) => {
					const i = this.replyHandlers.get(o);
					i && (i.callback(s), this.replyHandlers.delete(o));
				})
				.catch((s) => {
					console.error(`[IPCRendererShim] sendTo error: ${e}`, s);
					const i = this.replyHandlers.get(o);
					i &&
						(i.callback({ error: s.message }),
						this.replyHandlers.delete(o));
				}));
	}
	onReply(e, n) {
		(console.log(`[IPCRendererShim] onReply: ${e}`),
			this.on(e, (t, ...o) => {
				n(o[0]);
			}));
	}
	registerTauriListener(e, n) {
		console.log(`[IPCRendererShim] Registering Tauri listener for: ${e}`);
	}
	cleanup() {
		(console.log("[IPCRendererShim] Cleaning up IPC listeners"),
			this.listeners.clear(),
			this.onceListeners.clear(),
			this.replyHandlers.clear());
	}
}
let d = null;
function w() {
	return (
		d ||
			((d = new g()),
			console.log("[IPCRendererShim] IPCRenderer instance created")),
		d
	);
}
function f() {
	if (typeof window > "u") return;
	if (window.__IPC_RENDERER_SHIM_INSTALLED__) {
		console.log("[IPCRendererShim] Already installed, skipping");
		return;
	}
	((window.__IPC_RENDERER_SHIM_INSTALLED__ = !0),
		console.log(
			"[IPCRendererShim] Installing Electron IPC renderer polyfill...",
		));
	const r = w();
	(typeof window.vscode < "u" &&
		((window.vscode.ipcRenderer = r),
		console.log(
			"[IPCRendererShim]\u2001\u2713 IPCRenderer attached to window.vscode",
		)),
		(window.__IPC_RENDERER__ = r),
		console.log(
			"[IPCRendererShim]\u2001\u2713 Electron IPC renderer polyfill installed",
		));
}
var I = { install: f, get: w };
typeof window < "u" && f();
export {
	g as IPCRendererClass,
	I as default,
	w as getIPCRenderer,
	f as installIPCRendererShim,
};
