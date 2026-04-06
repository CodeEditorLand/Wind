import { Stream as c, Effect as e, Layer as r } from "effect";

import o from "../Tag/TelemetryTag.js";

const t = () => ({
		recordMetric: () => e.void,
		startSpan: () => e.succeed({ end: () => e.void }),
		log: () => e.void,
		events: c.empty,
		getMetrics: () => e.succeed([]),
		getAverageDuration: () => e.succeed(0),
		getSuccessRate: () => e.succeed(0),
		flush: e.void,
	}),
	m = r.succeed(o, t());
var a = m;
export { a as default, t as makeMockTelemetry };
