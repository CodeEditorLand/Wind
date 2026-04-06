import { SubscriptionRef as c, Effect as d, Layer as p } from "effect";

import { Telemetry as I } from "../../Telemetry.js";
import { ActivityBarTag as f } from "../Tag/ActivityBarTag.js";
import {
	MakeRemoveItem as A,
	MakeUpdateItem as B,
	MakeCreateItem as g,
	MakeSetActiveItem as k,
	MakeGetItem as l,
	MakeSetBadge as S,
	MakeGetBadge as T,
} from "./ActivityBarHelper.js";

const u = p.effect(
	f,
	d.gen(function* () {
		const t = yield* I,
			e = yield* c.make([]),
			r = yield* c.make(void 0),
			i = l(e),
			o = g(e, t),
			a = B(e, i, t),
			n = A(e, r, i, t),
			y = k(r, i, t),
			m = S(a),
			s = T(i);
		return (
			yield* t.log("info", "ActivityBar service initialized"),
			{
				createItem: o,
				updateItem: a,
				removeItem: n,
				getItem: i,
				items: e.get,
				itemsChanges: e.changes,
				setActiveItem: y,
				getActiveItem: r.get,
				activeItemChanges: r.changes,
				setBadge: m,
				getBadge: s,
				clearBadge: (v) => m(v, void 0),
			}
		);
	}),
);
var j = u;
export { u as ActivityBarLive, j as default };
