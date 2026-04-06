import { Layer as b, SubscriptionRef as l, Effect as n } from "effect";

import { Telemetry as R } from "../../Telemetry.js";
import N from "../Error/PanelUpdateError.js";
import y from "../Error/PanelViewNotFoundError.js";
import C from "../Tag/PanelTag.js";

const F = b.effect(
	C,
	n.gen(function* () {
		const o = yield* R,
			a = yield* l.make([]),
			d = yield* l.make(void 0),
			V = (e) =>
				n.gen(function* () {
					const i = `panel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
						t = { ...e, id: i };
					return (
						yield* l.modify(a, (r) => [
							void 0,
							[...r, t].sort((f, g) => f.priority - g.priority),
						]),
						yield* o.log("info", `Created panel view: ${i}`),
						t
					);
				}),
			c = (e, i) =>
				n.gen(function* () {
					if (!(yield* s(e))) return yield* n.fail(new y(e));
					try {
						(yield* l.modify(a, (r) => [
							void 0,
							r
								.map((f) => (f.id === e ? { ...f, ...i } : f))
								.sort((f, g) => f.priority - g.priority),
						]),
							yield* o.log("info", `Updated panel view: ${e}`));
					} catch (r) {
						return yield* n.fail(new N(e, r));
					}
				}),
			m = (e) =>
				n.gen(function* () {
					if (!(yield* s(e))) return yield* n.fail(new y(e));
					(yield* l.modify(a, (r) => [
						void 0,
						r.filter((f) => f.id !== e),
					]),
						(yield* d.get) === e && (yield* l.set(d, void 0)),
						yield* o.log("info", `Removed panel view: ${e}`));
				}),
			s = (e) => n.map(a.get, (i) => i.find((t) => t.id === e)),
			w = a.get,
			v = a.changes,
			E = (e) =>
				n.gen(function* () {
					if (!(yield* s(e))) return yield* n.fail(new y(e));
					(yield* l.modify(a, (t) => [
						void 0,
						t.map((r) =>
							r.id === e
								? { ...r, visible: !0, maximized: !1 }
								: r,
						),
					]),
						yield* l.set(d, e),
						yield* o.log("info", `Set active panel view: ${e}`));
				}),
			p = d.get,
			u = d.changes,
			P = (e) =>
				n.gen(function* () {
					(yield* c(e, { visible: !0 }),
						yield* o.log("info", `Showed panel view: ${e}`));
				}),
			x = (e) =>
				n.gen(function* () {
					(yield* c(e, { visible: !1 }),
						yield* o.log("info", `Hid panel view: ${e}`));
				}),
			h = (e) =>
				n.gen(function* () {
					const i = yield* s(e);
					if (!i) return yield* n.fail(new y(e));
					(yield* c(e, { visible: !i.visible }),
						yield* o.log("info", `Toggled panel view: ${e}`));
				}),
			z = (e) =>
				n.gen(function* () {
					(yield* l.modify(a, (i) => [
						void 0,
						i.map((t) =>
							t.id === e
								? { ...t, maximized: !0 }
								: { ...t, maximized: !1 },
						),
					]),
						yield* o.log("info", `Maximized panel view: ${e}`));
				}),
			A = (e) =>
				n.gen(function* () {
					(yield* c(e, { maximized: !1 }),
						yield* o.log("info", `Restored panel view: ${e}`));
				}),
			S = (e) => n.map(w, (i) => i.filter((t) => t.type === e)),
			T = n.map(w, (e) => e.filter((i) => i.visible)),
			$ = n.map(w, (e) => e.find((i) => i.maximized));
		return (
			yield* o.log("info", "Panel service initialized"),
			{
				createView: V,
				updateView: c,
				removeView: m,
				getView: s,
				views: w,
				viewsChanges: v,
				setActiveView: E,
				getActiveView: p,
				activeViewChanges: u,
				showView: P,
				hideView: x,
				toggleView: h,
				maximizeView: z,
				restoreView: A,
				getViewsByType: S,
				getVisibleViews: T,
				getMaximizedView: $,
			}
		);
	}),
);
var L = F;
export { L as default };
