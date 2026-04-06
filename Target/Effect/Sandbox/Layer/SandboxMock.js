import { Effect as e, Layer as r } from "effect";

import {
	ConfigurationNotReadyError as a,
	SandboxNotReadyError as o,
} from "../../../Types/Sandbox.js";
import { Sandbox as i } from "../Tag/SandboxTag.js";

const n = r.succeed(i, {
	globals: e.die(new o()),
	isReady: e.succeed(!1),
	awaitReady: e.die(new o()),
	ipc: e.die(new o()),
	configuration: e.die(new o()),
	resolveConfiguration: e.fail(new a()),
});
var c = n;
export { c as default };
