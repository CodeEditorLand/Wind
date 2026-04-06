import { Stream as a, Layer as d, Effect as e } from "effect";

import r from "../Tag/SidebarTag.js";

const t = () => ({
		createPanel: (i) =>
			e.succeed({ ...i, id: `mock-sidebar-${Date.now()}` }),
		updatePanel: (i, o) => e.void,
		removePanel: (i) => e.void,
		getPanel: (i) => e.succeed(void 0),
		panels: e.succeed([]),
		panelsChanges: a.empty,
		setActivePanel: (i) => e.void,
		getActivePanel: e.succeed(void 0),
		activePanelChanges: a.empty,
		togglePanel: (i) => e.void,
		collapsePanel: (i) => e.void,
		expandPanel: (i) => e.void,
		getPanelsByPosition: (i) => e.succeed([]),
	}),
	n = d.succeed(r, t());
var l = n;
export { l as default, t as makeMockSidebar };
