import { exit } from "@tauri-apps/api/process";
import { Effect } from "effect";

import { HostProblem } from "../Error.js";

export const ExitApplication = Effect.tryPromise({
	try: () => exit(0),
	catch: (cause) => new HostProblem({ cause, operation: "exit" }),
});
