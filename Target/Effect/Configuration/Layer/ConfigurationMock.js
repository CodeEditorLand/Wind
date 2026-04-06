import { Stream as a, Effect as o, Layer as t } from "effect";

import { MakeValidate as c } from "../Implementation/ConfigurationHelper.js";
import { ConfigurationTag as n } from "../Tag/ConfigurationTag.js";

const f = (r) => {
		const i = c(),
			e = {
				zoomLevel: 0,
				userEnv: {},
				workspace: {
					id: "mock-workspace",
					uri: "mock://workspace",
					name: "Mock Workspace",
				},
				...r,
			};
		return {
			get: o.succeed(e),
			fetch: o.succeed(e),
			validate: i,
			apply: () => o.void,
			changes: a.empty,
			refresh: o.succeed(e),
		};
	},
	s = t.succeed(n, f());
var g = s;
export { s as ConfigurationMock, g as default, f as makeMockConfiguration };
