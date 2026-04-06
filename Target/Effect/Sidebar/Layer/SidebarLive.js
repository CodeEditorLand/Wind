import { Layer as h, Effect as i, SubscriptionRef as l } from "effect";

import { Telemetry as w } from "../../Telemetry.js";
import g from "../Error/SidebarPanelNotFoundError.js";
import N from "../Error/SidebarUpdateError.js";
import $ from "../Tag/SidebarTag.js";

const F = h.effect(
	$,
	i.gen(function* () {
		const o = yield* w,
			d = yield* l.make([]),
			f = yield* l.make(void 0),
			P = (e) =>
				i.gen(function* () {
					const n = `sidebar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
						r = { ...e, id: n };
					return (
						yield* l.modify(d, (t) => [
							void 0,
							[...t, r].sort((a, y) => a.priority - y.priority),
						]),
						yield* o.log("info", `Created sidebar panel: ${n}`),
						r
					);
				}),
			c = (e, n) =>
				i.gen(function* () {
					if (!(yield* s(e))) return yield* i.fail(new g(e));
					try {
						(yield* l.modify(d, (t) => [
							void 0,
							t
								.map((a) => (a.id === e ? { ...a, ...n } : a))
								.sort((a, y) => a.priority - y.priority),
						]),
							yield* o.log(
								"info",
								`Updated sidebar panel: ${e}`,
							));
					} catch (t) {
						return yield* i.fail(new N(e, t));
					}
				}),
			E = (e) =>
				i.gen(function* () {
					if (!(yield* s(e))) return yield* i.fail(new g(e));
					(yield* l.modify(d, (t) => [
						void 0,
						t.filter((a) => a.id !== e),
					]),
						(yield* f.get) === e && (yield* l.set(f, void 0)),
						yield* o.log("info", `Removed sidebar panel: ${e}`));
				}),
			s = (e) => i.map(d.get, (n) => n.find((r) => r.id === e)),
			p = d.get,
			b = d.changes,
			u = (e) =>
				i.gen(function* () {
					if (!(yield* s(e))) return yield* i.fail(new g(e));
					(yield* l.modify(d, (r) => [
						void 0,
						r.map((t) =>
							t.id === e ? { ...t, collapsed: !1 } : t,
						),
					]),
						yield* l.set(f, e),
						yield* o.log("info", `Set active sidebar panel: ${e}`));
				}),
			S = f.get,
			m = f.changes,
			v = (e) =>
				i.gen(function* () {
					const n = yield* s(e);
					if (!n) return yield* i.fail(new g(e));
					(yield* c(e, { collapsed: !n.collapsed }),
						yield* o.log("info", `Toggled sidebar panel: ${e}`));
				}),
			C = (e) =>
				i.gen(function* () {
					(yield* c(e, { collapsed: !0 }),
						yield* o.log("info", `Collapsed sidebar panel: ${e}`));
				}),
			x = (e) =>
				i.gen(function* () {
					(yield* c(e, { collapsed: !1 }),
						yield* o.log("info", `Expanded sidebar panel: ${e}`));
				}),
			A = (e) => i.map(p, (n) => n.filter((r) => r.position === e));
		return (
			yield* o.log("info", "Sidebar service initialized"),
			{
				createPanel: P,
				updatePanel: c,
				removePanel: E,
				getPanel: s,
				panels: p,
				panelsChanges: b,
				setActivePanel: u,
				getActivePanel: S,
				activePanelChanges: m,
				togglePanel: v,
				collapsePanel: C,
				expandPanel: x,
				getPanelsByPosition: A,
			}
		);
	}),
);
var L = F;
export { L as default };
