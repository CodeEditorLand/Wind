import {
	Schedule as _,
	Layer as C,
	Stream as m,
	Effect as n,
	SubscriptionRef as r,
} from "effect";

import { ConfigurationNotReadyError as h } from "../../../Types/Sandbox.js";
import { ConfigFetchError as E } from "../Error/ConfigFetchError.js";
import { ConfigurationTag as S } from "../Tag/ConfigurationTag.js";

import "../Error/ConfigApplyError.js";
import "../Error/ConfigValidationError.js";

import { IPC as b } from "../../IPC.js";
import { MountainTag as R } from "../../Mountain.js";
import { Sandbox as x } from "../../Sandbox.js";

import "../../Telemetry.js";

import { MakeApply as I, MakeValidate as v } from "./ConfigurationHelper.js";

const k = C.effect(
		S,
		n.gen(function* () {
			const l = yield* x,
				u = yield* b,
				g = v(),
				t = yield* r.make(null),
				f = n.gen(function* () {
					const o = yield* l.resolveConfiguration.pipe(n.either);
					return o._tag === "Right"
						? o.right
						: yield* u
								.invoke("mountain_get_workbench_configuration")(
									[],
								)
								.pipe(n.mapError((e) => new E(e)));
				}),
				i = I(),
				a = t.changes.pipe(m.filter((o) => o !== null)),
				d = n.gen(function* () {
					const o = yield* t.get;
					return o || (yield* n.fail(new h()));
				}),
				p = n.gen(function* () {
					const o = yield* f;
					return (yield* r.set(t, o), o);
				});
			return (
				yield* f.pipe(n.flatMap((o) => r.set(t, o))),
				yield* n.log(
					"[Configuration] Configuration service initialized",
				),
				{
					get: d,
					fetch: f,
					validate: g,
					apply: i,
					changes: a,
					refresh: p,
				}
			);
		}),
	),
	W = C.effect(
		S,
		n.gen(function* () {
			const l = yield* x,
				u = yield* b,
				g = yield* R,
				t = v(),
				f = I(),
				i = yield* r.make(null),
				a = n.gen(function* () {
					const e = yield* l.resolveConfiguration.pipe(n.either);
					return e._tag === "Right"
						? e.right
						: yield* u
								.invoke("mountain_get_workbench_configuration")(
									[],
								)
								.pipe(n.mapError((s) => new E(s)));
				}),
				d = i.changes.pipe(m.filter((e) => e !== null)),
				p = n.gen(function* () {
					const e = yield* i.get;
					return e || (yield* n.fail(new h()));
				}),
				o = n.gen(function* () {
					const e = yield* a;
					return (yield* r.set(i, e), e);
				});
			return (
				yield* a.pipe(n.flatMap((e) => r.set(i, e))),
				yield* n.fork(
					n.gen(function* () {
						(yield* g.connectionState)._tag === "Connected" &&
							(yield* n.repeat(
								n.gen(function* () {
									const s = yield* g.rpc(
										"mountain_get_configuration",
									)();
									s &&
										(yield* t(s).pipe(
											n.flatMap((c) =>
												n.gen(function* () {
													const y = yield* i.get;
													(!y ||
														JSON.stringify(y) !==
															JSON.stringify(
																c,
															)) &&
														(yield* r.set(i, c),
														yield* f(c));
												}),
											),
											n.catchAll((c) =>
												n.sync(() => {
													console.error(
														"[Configuration] Sync error:",
														c,
													);
												}),
											),
										));
								}),
								_.spaced("5 seconds"),
							));
					}),
				),
				yield* n.log(
					"[Configuration] Configuration service with sync initialized",
				),
				{
					get: p,
					fetch: a,
					validate: t,
					apply: f,
					changes: d,
					refresh: o,
				}
			);
		}),
	);
var q = k;
export { k as ConfigurationLive, W as ConfigurationWithSyncLive, q as default };
