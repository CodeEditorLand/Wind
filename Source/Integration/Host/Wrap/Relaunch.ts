import { relaunch } from "@tauri-apps/api/process";
import { Effect } from "effect";

import { HostProblem } from "../Error.js";

const Relaunch = (options?: any): Effect.Effect<void, HostProblem> =>
	Effect.tryPromise({
		try: () => relaunch(),
		catch: (cause) => new HostProblem({ cause, operation: "relaunch" }),
	});

export default Relaunch;
