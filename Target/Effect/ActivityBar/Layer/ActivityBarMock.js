import { Layer as a, Effect as e, Stream as i } from "effect";

import { ActivityBarTag as c } from "../Tag/ActivityBarTag.js";

const d = a.succeed(c, {
	createItem: (t) =>
		e.succeed({ ...t, id: `mock-activitybar-${Date.now()}` }),
	updateItem: (t, r) => e.void,
	removeItem: (t) => e.void,
	getItem: (t) => e.succeed(void 0),
	items: e.succeed([]),
	itemsChanges: i.empty,
	setActiveItem: (t) => e.void,
	getActiveItem: e.succeed(void 0),
	activeItemChanges: i.empty,
	setBadge: (t, r) => e.void,
	getBadge: (t) => e.succeed(void 0),
	clearBadge: (t) => e.void,
});
var v = d;
export { d as ActivityBarMockLive, v as default };
