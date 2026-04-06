import { Layer as b, Effect as n, Context as y } from "effect";

import "../Tag/SandboxTag.js";

import {
	ConfigurationNotReadyError as c,
	SandboxNotReadyError as o,
} from "../../../Types/Sandbox.js";

const u = b.effect(
	y.GenericTag("Sandbox"),
	n.gen(function* () {
		const s = n.sync(() => {
				const e = window.vscode;
				return !!e && typeof e == "object";
			}),
			t = n
				.sync(() => {
					const e = window.vscode;
					if (!e) throw new o();
					return e;
				})
				.pipe(n.mapError(() => new o())),
			d = n
				.gen(function* () {
					let e = 0;
					const p = 300;
					for (; e < p; ) {
						const r = window.preloadGlobals;
						if (r && r.process && r.ipcRenderer) {
							const i = window.vscode;
							if (i)
								return (
									console.log(
										"[Sandbox] Preload globals and window.vscode ready",
									),
									i
								);
						}
						(e++, yield* n.sleep("100 millis"));
					}
					throw new o();
				})
				.pipe(
					n.timeout("30 seconds"),
					n.mapError(() => new o()),
				),
			l = n.gen(function* () {
				const e = yield* t;
				return e.ipcRenderer ? e.ipcRenderer : yield* n.fail(new o());
			}),
			a = n.gen(function* () {
				const e = yield* t;
				return e.context ? e.context : yield* n.fail(new o());
			}),
			f = n
				.gen(function* () {
					const e = yield* a;
					return yield* n.tryPromise({
						try: () => e.resolveConfiguration(),
						catch: () => new c(),
					});
				})
				.pipe(
					n.catchAll((e) =>
						e instanceof o ? n.fail(new c()) : n.fail(e),
					),
				);
		return {
			globals: t,
			isReady: s,
			awaitReady: d,
			ipc: l,
			configuration: a,
			resolveConfiguration: f,
		};
	}),
);
var v = u;
export { v as default };
