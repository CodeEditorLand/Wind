import {
	Schedule as d,
	Fiber as F,
	SubscriptionRef as f,
	Effect as n,
	Layer as O,
	Stream as u,
} from "effect";

import { MountainConnectionError as h } from "../Error/MountainConnectionError.js";
import { MountainRPCError as j } from "../Error/MountainRPCError.js";
import { MountainSyncError as x } from "../Error/MountainSyncError.js";
import { MountainTag as L } from "../Tag/MountainTag.js";

import "../Error/MountainStateError.js";

import { Configuration as J } from "../../Configuration.js";
import { IPC as N } from "../../IPC.js";
import { Telemetry as H } from "../../Telemetry.js";

const B = O.effect(
	L,
	n.gen(function* () {
		const m = yield* N,
			_ = yield* J,
			c = yield* H,
			p = yield* f.make({ _tag: "Idle" }),
			S = yield* f.make([]),
			E = d
				.exponential("100 millis")
				.pipe(
					d.union(d.spaced("5 seconds")),
					d.intersect(d.recurs(10)),
				),
			k = (o, t) =>
				n.gen(function* () {
					const i = yield* c.startSpan(o);
					return yield* t.pipe(
						n.tap(() => i.end(!0)),
						n.catchAll((r) =>
							n.gen(function* () {
								const s = r,
									e = s.message;
								return (yield* i.end(!1, e), yield* n.fail(s));
							}),
						),
					);
				}),
			y = (o) =>
				n.gen(function* () {
					(yield* f.modify(p, () => [void 0, o]),
						yield* c.log("info", `Mountain state: ${o._tag}`));
				}),
			w = p.get,
			v = p.changes,
			M = n.gen(function* () {
				yield* y({ _tag: "Connecting", attempt: 1 });
				const o = n.gen(function* () {
					const t = yield* m
						.invoke("mountain_get_status")([])
						.pipe(
							n.map((i) => {
								const r = i;
								return {
									connected: r.connected ?? !1,
									version: r.version ?? "unknown",
								};
							}),
							n.mapError((i) => new h(i)),
						);
					(t.connected ||
						(yield* n.fail(new h("Mountain not ready"))),
						yield* y({ _tag: "Connected", version: t.version }),
						yield* c.log(
							"info",
							`Connected to Mountain v${t.version}`,
						));
				});
				return yield* n.retry(k("mountain_connect", o), E).pipe(
					n.catchAll((t) =>
						n.gen(function* () {
							const i = t instanceof t ? t : new t(String(t));
							(yield* y({ _tag: "Error", error: i }),
								yield* c.log(
									"error",
									`Failed to connect: ${i.message}`,
								),
								yield* n.fail(t));
						}),
					),
				);
			}),
			R = n.gen(function* () {
				(yield* y({ _tag: "Disconnected", reason: "manual" }),
					yield* c.log("info", "Disconnected from Mountain"));
			}),
			g = (o) => (t) =>
				n.gen(function* () {
					(yield* p.get)._tag !== "Connected" && (yield* M);
					const r = yield* c.startSpan(`rpc_${o}`);
					return yield* m
						.invoke(o)(t ? [t] : [])
						.pipe(
							n.mapError((s) => new j(o, s)),
							n.tap(() => r.end(!0)),
							n.catchAll((s) =>
								n.gen(function* () {
									const e =
										s instanceof s ? s.message : String(s);
									(yield* r.end(!1, e),
										(e.includes("connection") ||
											e.includes("network")) &&
											(yield* y({
												_tag: "Disconnected",
												reason: "connection_lost",
											})),
										yield* n.fail(s));
								}),
							),
						);
				}),
			C = (o) =>
				n.gen(function* () {
					const t = yield* c.startSpan(`sync_${o}`),
						i = Date.now();
					yield* c.log("info", `Starting sync for ${o}`);
					const r = yield* n
							.gen(function* () {
								switch (o) {
									case "configuration": {
										const e = yield* g(
												"mountain_get_configuration",
											)(),
											a = yield* _.get,
											l = JSON.stringify(e),
											P = JSON.stringify(a);
										if (l !== P) {
											yield* _.apply(e);
											const $ = {
												type: "configuration",
												id: "main",
												data: e,
												timestamp: Date.now(),
												hash: l,
											};
											yield* f.modify(S, (I) => [
												void 0,
												[...I, $].slice(-1e3),
											]);
										}
										return {
											success: !0,
											resourcesSynced: 1,
											errors: [],
										};
									}
									case "services": {
										const e = yield* g(
												"mountain_get_services_status",
											)(),
											a = {
												type: "services",
												id: "all",
												data: e,
												timestamp: Date.now(),
												hash: JSON.stringify(e),
											};
										return (
											yield* f.modify(S, (l) => [
												void 0,
												[...l, a].slice(-1e3),
											]),
											{
												success: !0,
												resourcesSynced:
													Object.keys(e).length,
												errors: [],
											}
										);
									}
									case "state": {
										const e =
												yield* g(
													"mountain_get_state",
												)(),
											a = {
												type: "state",
												id: "main",
												data: e,
												timestamp: Date.now(),
												hash: JSON.stringify(e),
											};
										return (
											yield* f.modify(S, (l) => [
												void 0,
												[...l, a].slice(-1e3),
											]),
											{
												success: !0,
												resourcesSynced: 1,
												errors: [],
											}
										);
									}
									default:
										return {
											success: !1,
											resourcesSynced: 0,
											errors: [
												`Unknown resource type: ${o}`,
											],
										};
								}
							})
							.pipe(
								n.tap((e) => t.end(e.success, e.errors[0])),
								n.catchAll((e) =>
									n.gen(function* () {
										const a =
											e instanceof e
												? e.message
												: String(e);
										(yield* t.end(!1, a),
											yield* n.fail(new x(o, e)));
									}),
								),
							),
						s = Date.now() - i;
					return { ...r, duration: s };
				}),
			A = S.changes.pipe(u.flatMap((o) => u.fromIterable(o))),
			D = n.gen(function* () {
				return (yield* m
					.invoke("mountain_get_status")([])
					.pipe(
						n.map((t) => ({ version: t.version ?? "unknown" })),
						n.mapError((t) => new h(t)),
					)).version;
			}),
			b = n.gen(function* () {
				return yield* n.orElse(
					g("mountain_get_status")().pipe(
						n.map((o) => o.connected === !0),
					),
					() => n.succeed(!1),
				);
			});
		return (
			yield* n
				.gen(function* () {
					yield* u.runForEach(v, (o) =>
						o._tag === "Connected"
							? n.gen(function* () {
									(yield* c.log(
										"info",
										"Starting background sync",
									),
										yield* C("configuration").pipe(
											n.catchAll((i) =>
												c.log(
													"error",
													`Initial config sync failed: ${i.message}`,
												),
											),
										));
									const t = yield* u
										.fromSchedule(d.spaced("5 seconds"))
										.pipe(
											u.runForEach(() =>
												C("configuration").pipe(
													n.catchAll((i) =>
														c.log(
															"error",
															`Periodic sync failed: ${i.message}`,
														),
													),
												),
											),
											n.fork,
										);
									yield* v.pipe(
										u.filter(
											(i) =>
												i._tag === "Disconnected" ||
												i._tag === "Error",
										),
										u.runForEach(() => F.interrupt(t)),
									);
								})
							: n.void,
					);
				})
				.pipe(n.fork),
			yield* c.log("info", "Mountain service initialized"),
			{
				connectionState: w,
				connectionChanges: v,
				connect: M,
				disconnect: R,
				rpc: g,
				sync: C,
				syncEvents: A,
				version: D,
				healthCheck: b,
			}
		);
	}),
);
var nn = B;
export { B as MountainLive, nn as default };
