import { Layer as e } from "effect";

import {
	ConfigurationWithSyncLive as t,
	ConfigurationLive as v,
} from "../Configuration.js";
import { IPCElectronLive as o } from "../IPC.js";
import { MountainLive as r } from "../Mountain.js";
import { SandboxLive as i } from "../Sandbox.js";
import { TelemetryLive as p } from "../Telemetry.js";

const c = e.empty.pipe(
		e.provide(i),
		e.provide(o),
		e.provide(p),
		e.provide(v),
		e.provide(r),
	),
	d = e.empty.pipe(
		e.provide(i),
		e.provide(o),
		e.provide(p),
		e.provide(t),
		e.provide(r),
	),
	l = e.empty.pipe(
		e.provide(i),
		e.provide(o),
		e.provide(p),
		e.provide(t),
		e.provide(r),
	);
var x = d;
export {
	c as ElectronBaseLayer,
	l as ElectronDevLayer,
	d as ElectronLiveLayer,
	x as default,
};
