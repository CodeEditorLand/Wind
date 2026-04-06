async function s(o, e = {}) {
	try {
		if (typeof window.__TAURI__?.invoke < "u")
			return await window.__TAURI__.invoke(o, e);
		if (typeof window.TAURI?.invoke < "u")
			return await window.TAURI.invoke(o, e);
		throw new Error(`Tauri invoke not available for command: ${o}`);
	} catch (t) {
		throw (
			console.error(
				`[FileProtocolShim] Tauri invoke failed for ${o}:`,
				t,
			),
			t
		);
	}
}
const h = {
		matches(o) {
			return o.protocol === "vscode-file";
		},
		async handle(o) {
			try {
				console.log(
					`[FileProtocolShim] Handling vscode-file:// request: ${o.path}`,
				);
				const e = decodeURIComponent(o.path),
					t = o.headers?.get("X-Http-Method") || "GET";
				if (t === "GET" || !t)
					return {
						content: await s("file:read", {
							path: e,
							encoding: "utf8",
						}),
						metadata: {
							mime: a(e),
							lastModified: new Date().toISOString(),
						},
					};
				throw t === "PUT" || t === "POST"
					? new Error("File write not implemented via GET handler")
					: new Error(`Unsupported method: ${t}`);
			} catch (e) {
				return (
					console.error(
						"[FileProtocolShim] vscode-file handler error:",
						e,
					),
					{
						content: null,
						error: e instanceof Error ? e : new Error(String(e)),
					}
				);
			}
		},
	},
	u = {
		matches(o) {
			return o.protocol === "vscode-userdata";
		},
		async handle(o) {
			try {
				console.log(
					`[FileProtocolShim] Handling vscode-userdata:// request: ${o.path}`,
				);
				const t = `${await s("file:user_data_path", {})}/${o.path.replace(/^\//, "")}`;
				return {
					content: await s("file:read", {
						path: t,
						encoding: "utf8",
					}),
					metadata: {
						mime: a(o.path),
						lastModified: new Date().toISOString(),
					},
				};
			} catch (e) {
				return (
					console.error(
						"[FileProtocolShim] vscode-userdata handler error:",
						e,
					),
					{ content: "", error: void 0 }
				);
			}
		},
	},
	f = {
		matches(o) {
			return o.protocol === "vscode-resource";
		},
		async handle(o) {
			try {
				console.log(
					`[FileProtocolShim] Handling vscode-resource:// request: ${o.path}`,
				);
				const [e, ...t] = o.path.split("/").filter(Boolean),
					r = t.join("/");
				return {
					content: await s("cocoon:get_extension_resource", {
						extension_id: e,
						resource_path: r,
					}),
					metadata: { mime: a(r) },
				};
			} catch (e) {
				return (
					console.error(
						"[FileProtocolShim] vscode-resource handler error:",
						e,
					),
					{
						content: null,
						error: e instanceof Error ? e : new Error(String(e)),
					}
				);
			}
		},
	},
	g = {
		matches(o) {
			return o.protocol === "vscode-remote";
		},
		async handle(o) {
			try {
				console.log(
					`[FileProtocolShim] Handling vscode-remote:// request: ${o.path}`,
				);
				const [e, ...t] = o.path.split("/").filter(Boolean),
					r = t.join("/");
				return {
					content: await s("cocoon:read_remote_file", {
						host: e,
						path: r,
					}),
					metadata: { mime: a(r) },
				};
			} catch (e) {
				return (
					console.error(
						"[FileProtocolShim] vscode-remote handler error:",
						e,
					),
					{
						content: null,
						error: e instanceof Error ? e : new Error(String(e)),
					}
				);
			}
		},
	},
	S = {
		matches(o) {
			return o.protocol === "file";
		},
		async handle(o) {
			try {
				console.log(
					`[FileProtocolShim] Handling file:// request: ${o.path}`,
				);
				const e = decodeURIComponent(o.path);
				return {
					content: await s("file:read", {
						path: e,
						encoding: "utf8",
					}),
					metadata: {
						mime: a(e),
						lastModified: new Date().toISOString(),
					},
				};
			} catch (e) {
				return (
					console.error("[FileProtocolShim] file handler error:", e),
					{
						content: null,
						error: e instanceof Error ? e : new Error(String(e)),
					}
				);
			}
		},
	},
	d = [h, u, f, g, S];
function w(o) {
	return d.find((e) => e.matches(o)) ?? null;
}
function m(o) {
	try {
		const e = new URL(o),
			t = e.protocol.replace(/:$/, ""),
			r = e.pathname.replace(/^\//, ""),
			n = {};
		return (
			e.searchParams.forEach((l, c) => {
				n[c] = l;
			}),
			{ protocol: t, path: r, query: n }
		);
	} catch (e) {
		throw (
			console.error("[FileProtocolShim] Failed to parse URL:", o, e),
			new Error(`Invalid protocol URL: ${o}`)
		);
	}
}
function a(o) {
	const e = o.split(".").pop()?.toLowerCase();
	return (
		{
			js: "application/javascript",
			json: "application/json",
			ts: "application/typescript",
			html: "text/html",
			htm: "text/html",
			css: "text/css",
			md: "text/markdown",
			txt: "text/plain",
			xml: "application/xml",
			png: "image/png",
			jpg: "image/jpeg",
			jpeg: "image/jpeg",
			gif: "image/gif",
			svg: "image/svg+xml",
			wasm: "application/wasm",
		}[e ?? ""] ?? "application/octet-stream"
	);
}
function y() {
	const o = window.fetch;
	((window.fetch = async function (t, r) {
		try {
			const n =
				typeof t == "string"
					? t
					: t instanceof URL
						? t.toString()
						: t.url;
			if (P(n)) {
				const l = m(n),
					c = w(l);
				if (c) {
					const i = await c.handle({
						...l,
						headers: new Headers(r?.headers),
					});
					if (i.error) throw i.error;
					return new Response(i.content, {
						status: 200,
						headers: {
							"Content-Type":
								i.metadata?.mime ?? "application/octet-stream",
							"Cache-Control": "public, max-age=3600",
							...(i.metadata?.lastModified && {
								"Last-Modified": i.metadata.lastModified,
							}),
						},
					});
				}
			}
			return o(t, r);
		} catch (n) {
			return (
				console.error(
					"[FileProtocolShim] Fetch interception error:",
					n,
				),
				o(t, r)
			);
		}
	}),
		console.log(
			"[FileProtocolShim]\u2001\u2713 fetch interception installed",
		));
}
function P(o) {
	const e = o.split(":")[0];
	return [
		"vscode-file",
		"vscode-userdata",
		"vscode-resource",
		"vscode-remote",
	].includes(e);
}
function F() {
	(typeof window.__createImport < "u" &&
		console.log("[FileProtocolShim] Custom import interception available"),
		console.log(
			"[FileProtocolShim] Module import interception registered (passive mode)",
		));
}
function p() {
	if (!(typeof window > "u")) {
		if (window.__FILE_PROTOCOL_SHIM_INSTALLED__) {
			console.log("[FileProtocolShim] Already installed, skipping");
			return;
		}
		((window.__FILE_PROTOCOL_SHIM_INSTALLED__ = !0),
			console.log(
				"[FileProtocolShim] Installing VSCode protocol polyfills...",
			),
			y(),
			F(),
			console.log(
				"[FileProtocolShim]\u2001\u2713 VSCode protocol polyfills installed",
			));
	}
}
const R = { install: p, handlers: d, parseProtocolURL: m, inferMimeType: a };
typeof window < "u" && p();
export { R as FileProtocolShim, p as installFileProtocolShim };
