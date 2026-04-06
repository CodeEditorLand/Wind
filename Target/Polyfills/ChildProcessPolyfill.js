async function c(r, e = {}) {
	try {
		if (typeof window.__TAURI__?.invoke < "u")
			return await window.__TAURI__.invoke(r, e);
		if (typeof window.TAURI?.invoke < "u")
			return await window.TAURI.invoke(r, e);
		throw new Error(`Tauri invoke not available for command: ${r}`);
	} catch (n) {
		throw (
			console.error(
				`[ChildProcessPolyfill] Tauri invoke failed for ${r}:`,
				n,
			),
			n
		);
	}
}
function a(r, e) {
	if (typeof window.__TAURI__?.event?.listen == "function") {
		const n = window.__TAURI__.event.listen(r, ({ payload: s }) => {
			e(s);
		});
		return () => {
			n.then((s) => s());
		};
	}
	if (typeof window.TAURI?.event?.listen == "function") {
		const n = window.TAURI.event.listen(r, ({ payload: s }) => {
			e(s);
		});
		return () => {
			n.then((s) => s());
		};
	}
	return (
		console.warn(
			`[ChildProcessPolyfill] Tauri event listener not available for: ${r}`,
		),
		() => {}
	);
}
function w(r) {
	const e = new Map();
	return {
		write(n) {
			return (
				console.log(
					`[ChildProcessPolyfill] Stream write (${r}):`,
					n.toString().slice(0, 100),
				),
				!0
			);
		},
		end(n) {
			(console.log(`[ChildProcessPolyfill] Stream end (${r})`),
				this.emit("end"));
		},
		on(n, s) {
			(e.has(n) || e.set(n, new Set()), e.get(n).add(s));
		},
		removeAllListeners(n) {
			n ? e.delete(n) : e.clear();
		},
		emit(n, ...s) {
			const i = e.get(n);
			i &&
				i.forEach((l) => {
					try {
						l(...s);
					} catch (o) {
						console.error(
							`[ChildProcessPolyfill] Stream event error (${n}):`,
							o,
						);
					}
				});
		},
	};
}
class u {
	pid = 0;
	killed = !1;
	exitCode = null;
	signalCode = null;
	stdin;
	stdout;
	stderr;
	stdio;
	listeners = new Map();
	_sPid;
	constructor(e) {
		((this._sPid = e),
			(this.stdin = w("write")),
			(this.stdout = w("read")),
			(this.stderr = w("read")),
			(this.stdio = [this.stdin, this.stdout, this.stderr]),
			this.setupEventListeners());
	}
	setupEventListeners() {
		const e = a(`child_process:spawn:${this._sPid}`, (o) => {
				(console.log(
					`[ChildProcessPolyfill] Spawn event for ${this._sPid}:`,
					o,
				),
					this.emit("spawn"));
			}),
			n = a(`child_process:exit:${this._sPid}`, (o) => {
				console.log(
					`[ChildProcessPolyfill] Exit event for ${this._sPid}:`,
					o,
				);
				const t = o;
				((this.exitCode = t.exit_code),
					(this.signalCode = t.signal),
					(this.killed = !0),
					this.emit("exit", this.exitCode, this.signalCode),
					this.emit("close", this.exitCode, this.signalCode));
			}),
			s = a(`child_process:error:${this._sPid}`, (o) => {
				(console.error(
					`[ChildProcessPolyfill] Error event for ${this._sPid}:`,
					o,
				),
					this.emit("error", o));
			}),
			i = a(`child_process:stdout:${this._sPid}`, (o) => {
				const t = o;
				this.stdout.emit(
					"data",
					t.data instanceof Buffer ? t.data : Buffer.from(t.data),
				);
			}),
			l = a(`child_process:stderr:${this._sPid}`, (o) => {
				const t = o;
				this.stderr.emit(
					"data",
					t.data instanceof Buffer ? t.data : Buffer.from(t.data),
				);
			});
		this._unlistenFunctions = [e, n, s, i, l];
	}
	_unlistenFunctions = [];
	on(e, n) {
		return (
			console.log(`[ChildProcessPolyfill] on(${e}) for ${this._sPid}`),
			this.listeners.has(e) || this.listeners.set(e, new Set()),
			this.listeners.get(e).add(n),
			this
		);
	}
	once(e, n) {
		const s = (...i) => {
			(this.removeListener(e, s), n(...i));
		};
		return this.on(e, s);
	}
	removeListener(e, n) {
		const s = this.listeners.get(e);
		return (
			s && (s.delete(n), s.size === 0 && this.listeners.delete(e)),
			this
		);
	}
	removeAllListeners(e) {
		return (e ? this.listeners.delete(e) : this.listeners.clear(), this);
	}
	emit(e, ...n) {
		const s = this.listeners.get(e);
		return !s || s.size === 0
			? !1
			: (s.forEach((i) => {
					try {
						i(...n);
					} catch (l) {
						console.error(
							`[ChildProcessPolyfill] Error in ${e} listener:`,
							l,
						);
					}
				}),
				!0);
	}
	kill(e = "SIGTERM") {
		return (
			console.log(
				`[ChildProcessPolyfill] Kill ${this._sPid} with signal: ${e}`,
			),
			this.killed ||
				((this.signalCode = e),
				c("child_process:kill", {
					spawn_id: this._sPid,
					signal: e,
				}).catch((n) => {
					console.error(
						`[ChildProcessPolyfill] Kill error for ${this._sPid}:`,
						n,
					);
				})),
			!0
		);
	}
	send(e, n, s) {
		return (
			console.log(
				`[ChildProcessPolyfill] Send message to ${this._sPid}:`,
				e,
			),
			c("child_process:send", { spawn_id: this._sPid, message: e }).catch(
				(i) => {
					console.error(
						`[ChildProcessPolyfill] Send error for ${this._sPid}:`,
						i,
					);
				},
			),
			!0
		);
	}
	disconnect() {
		(console.log(`[ChildProcessPolyfill] Disconnect from ${this._sPid}`),
			this.removeAllListeners(),
			this._unlistenFunctions.forEach((e) => e()),
			this.stdin.end());
	}
	ref() {
		return this;
	}
	unref() {
		return this;
	}
	cleanup() {
		(this._unlistenFunctions.forEach((e) => e()),
			(this._unlistenFunctions = []));
	}
}
function P(r, e, n) {
	console.log(`[ChildProcessPolyfill] spawn: ${r} ${e?.join(" ") ?? ""}`);
	const s = `spawn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
		i = new u(s);
	return (
		c("electron:spawn_child_process", {
			command: r,
			args: e ?? [],
			cwd: n?.cwd,
			env: n?.env,
			shell: n?.shell,
		})
			.then((l) => {
				l.success
					? ((i.pid = l.pid),
						console.log(
							`[ChildProcessPolyfill] Process spawned with PID: ${i.pid}`,
						),
						i.emit("spawn"))
					: i.emit(
							"error",
							new Error(l.error ?? "Failed to spawn process"),
						);
			})
			.catch((l) => {
				(console.error("[ChildProcessPolyfill] spawn error:", l),
					i.emit("error", l));
			}),
		i
	);
}
function h(r, e, n) {
	console.log(`[ChildProcessPolyfill] exec: ${r}`);
	const s = `exec_${Date.now()}_${Math.random().toString(36).substring(7)}`,
		i = new u(s);
	let l = "",
		o = "",
		t = null;
	return (
		i.stdout.on("data", (d) => {
			l += d.toString(e?.encoding ?? "utf8");
		}),
		i.stderr.on("data", (d) => {
			o += d.toString(e?.encoding ?? "utf8");
		}),
		i.on("exit", (d) => {
			(d !== 0 &&
				((t = new Error(`Command failed: ${r}
${o}`)),
				(t.code = d ?? void 0),
				(t.killed = i.killed)),
				n && n(t, l, o));
		}),
		c("electron:exec_command", {
			command: r,
			cwd: e?.cwd,
			env: e?.env,
			shell: e?.shell,
			timeout: e?.timeout,
		})
			.then((d) => {
				d.success
					? (i.pid = d.pid)
					: ((t = new Error(d.error ?? "Failed to execute command")),
						i.emit("error", t));
			})
			.catch((d) => {
				((t = d), i.emit("error", d));
			}),
		i
	);
}
function S(r, e) {
	return new Promise((n, s) => {
		const i = h(r, e, (l, o, t) => {
			l ? s(l) : n({ stdout: o, stderr: t });
		});
	});
}
function g(r, e, n) {
	console.log(`[ChildProcessPolyfill] fork: ${r}`);
	const s = `fork_${Date.now()}_${Math.random().toString(36).substring(7)}`,
		i = new u(s);
	if (r.includes("extensionHost") || r.includes("process"))
		c("electron:fork_extension_host", {
			module_path: r,
			args: e ?? [],
			cwd: n?.cwd,
			env: n?.env,
			exec_path: n?.execPath,
			exec_argv: n?.execArgv,
			silent: n?.silent,
		})
			.then((o) => {
				o.success
					? ((i.pid = o.pid),
						console.log(
							`[ChildProcessPolyfill] Extension host forked with PID: ${i.pid}`,
						),
						i.emit("spawn"))
					: i.emit(
							"error",
							new Error(
								o.error ?? "Failed to fork extension host",
							),
						);
			})
			.catch((o) => {
				(console.error("[ChildProcessPolyfill] fork error:", o),
					i.emit("error", o));
			});
	else {
		const o = P(n?.execPath ?? _.execPath, [r, ...(e ?? [])], {
			cwd: n?.cwd,
			env: n?.env,
			silent: n?.silent ? "pipe" : "inherit",
		});
		i.pid = o.pid;
	}
	return i;
}
const f = {
	spawn: P,
	exec: h,
	execSync: () => {
		throw new Error(
			"childProcess.execSync() is not supported in browser/Tauri environment. Use async exec() instead.",
		);
	},
	fork: g,
	execFile: h,
};
function p() {
	if (!(typeof window > "u")) {
		if (window.__CHILD_PROCESS_POLYFILL_INSTALLED__) {
			console.log("[ChildProcessPolyfill] Already installed, skipping");
			return;
		}
		if (
			((window.__CHILD_PROCESS_POLYFILL_INSTALLED__ = !0),
			console.log(
				"[ChildProcessPolyfill] Installing Node.js child_process module polyfill...",
			),
			(window.childProcess = f),
			typeof window.require == "function")
		) {
			const r = window.require;
			window.require = (e) => (e === "child_process" ? f : r(e));
		}
		(typeof window.vscode < "u" && (window.vscode.childProcess = f),
			console.log(
				"[ChildProcessPolyfill]\u2001\u2713 Node.js child_process module polyfill installed",
			));
	}
}
const _ =
	typeof window < "u" && window.process
		? window.process
		: { execPath: "/usr/local/bin/node" };
var v = {
	install: p,
	module: f,
	spawn: P,
	exec: h,
	execPromise: S,
	fork: g,
	ChildProcess: u,
};
typeof window < "u" && p();
export { v as default, p as installChildProcessPolyfill };
