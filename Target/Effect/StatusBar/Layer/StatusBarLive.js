import { Layer as I, SubscriptionRef as m, Effect as r } from "effect";

import { Telemetry as b } from "../../Telemetry.js";
import d from "../Error/StatusBarItemNotFoundError.js";
import x from "../Error/StatusBarUpdateError.js";
import v from "../Tag/StatusBarTag.js";

const T = I.effect(
	v,
	r.gen(function* () {
		const f = yield* b,
			o = yield* m.make([]),
			y = (t) =>
				r.gen(function* () {
					const e = `statusbar-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
						i = { ...t, id: e };
					return (
						yield* m.modify(o, (n) => [
							void 0,
							[...n, i].sort((a, c) => a.priority - c.priority),
						]),
						yield* f.log("info", `Created status bar item: ${e}`),
						i
					);
				}),
			u = (t, e) =>
				r.gen(function* () {
					if (!(yield* s(t))) return yield* r.fail(new d(t));
					try {
						(yield* m.modify(o, (n) => [
							void 0,
							n
								.map((a) => (a.id === t ? { ...a, ...e } : a))
								.sort((a, c) => a.priority - c.priority),
						]),
							yield* f.log(
								"info",
								`Updated status bar item: ${t}`,
							));
					} catch (n) {
						return yield* r.fail(new x(t, n));
					}
				}),
			l = (t) =>
				r.gen(function* () {
					if (!(yield* s(t))) return yield* r.fail(new d(t));
					(yield* m.modify(o, (i) => [
						void 0,
						i.filter((n) => n.id !== t),
					]),
						yield* f.log("info", `Removed status bar item: ${t}`));
				}),
			s = (t) => r.map(o.get, (e) => e.find((i) => i.id === t)),
			g = o.get,
			S = o.changes,
			E = (t, e) =>
				r.gen(function* () {
					if (!(yield* s(t))) return yield* r.fail(new d(t));
					e ? yield* r.void : yield* l(t);
				}),
			p = (t) => r.map(s(t), (e) => e?.text),
			B = (t, e) => u(t, { text: e });
		return (
			yield* f.log("info", "StatusBar service initialized"),
			{
				createItem: y,
				updateItem: u,
				removeItem: l,
				getItem: s,
				items: g,
				itemsChanges: S,
				setItemVisibility: E,
				getItemText: p,
				setItemText: B,
			}
		);
	}),
);
var $ = T;
export { $ as default };
