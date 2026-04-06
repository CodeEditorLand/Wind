import { Effect as e, Layer as r } from "effect";

import { IPCTag as f } from "../../IPC.js";
import { MountainTag as a } from "../../Mountain.js";
import { TelemetryTag as c } from "../../Telemetry.js";
import m from "../Implementation/MountainSyncImplementation.js";
import i from "../Tag/MountainSyncTag.js";

const y = r.effect(
	i,
	e.gen(function* () {
		const t = yield* a,
			o = yield* f,
			n = yield* c;
		return m(t, o, n);
	}),
);
var s = y;
export { s as default };
