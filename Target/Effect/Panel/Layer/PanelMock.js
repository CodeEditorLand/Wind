import { Effect as e, Layer as n, Stream as t } from "effect";

import a from "../Tag/PanelTag.js";

const d = () => ({
		createView: (i) => e.succeed({ ...i, id: `mock-panel-${Date.now()}` }),
		updateView: (i, s) => e.void,
		removeView: (i) => e.void,
		getView: (i) => e.succeed(void 0),
		views: e.succeed([]),
		viewsChanges: t.empty,
		setActiveView: (i) => e.void,
		getActiveView: e.succeed(void 0),
		activeViewChanges: t.empty,
		showView: (i) => e.void,
		hideView: (i) => e.void,
		toggleView: (i) => e.void,
		maximizeView: (i) => e.void,
		restoreView: (i) => e.void,
		getViewsByType: (i) => e.succeed([]),
		getVisibleViews: e.succeed([]),
		getMaximizedView: e.succeed(void 0),
	}),
	r = n.succeed(a, d());
var w = r;
export { w as default, d as makeMockPanel };
