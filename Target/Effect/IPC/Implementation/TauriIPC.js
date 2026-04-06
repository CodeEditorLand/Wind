import { invoke as f } from "@tauri-apps/api/core";
import { listen as a, emit as y } from "@tauri-apps/api/event";
import { Effect as o, Stream as s } from "effect";

import { SandboxNotReadyError as p } from "../../../Types/Sandbox.js";
import {
	CreateIPCSendError as c,
	CreateIPCInvokeError as d,
	CreateIPCSubscriptionError as i,
} from "../Error/IPCError.js";

const l = o.gen(function* () {
	return typeof window < "u" && window.__TAURI__ !== void 0
		? {
				send: (r) => (e) =>
					o.try({
						try: () => y(r, e.length === 1 ? e[0] : e),
						catch: (n) => c(r, n),
					}),
				invoke: (r) => (e) =>
					o.tryPromise({
						try: () => {
							const n = e.length === 1 ? e[0] : e;
							return f(r, n);
						},
						catch: (n) => d(r, n),
					}),
				events: (r) =>
					s.async((e) => {
						let n;
						return (
							a(r, (t) => {
								e.single({ channel: r, args: [t.payload] });
							})
								.then((t) => {
									n = t;
								})
								.catch((t) => {
									e.fail(i(r, t));
								}),
							o.sync(() => n?.())
						);
					}),
				once: (r) =>
					o.async((e) => {
						a(r, (n) => {
							e(o.succeed({ channel: r, args: [n.payload] }));
						}).catch((n) => {
							e(o.fail(i(r, n)));
						});
					}),
				removeAllListeners: (r) =>
					o
						.log(`[IPC] Remove all listeners for ${r}`)
						.pipe(o.map(() => {})),
			}
		: yield* o.die(new p());
});
var P = l;
export { l as TauriIPCLive, P as default };
