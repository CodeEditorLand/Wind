import { exit } from "@tauri-apps/api/process";
import { Effect } from "effect";

import { HostProblem } from "../Error.js";

const Quit = Effect.tryPromise({
	try: () => exit(0),
	catch: (cause) => new HostProblem({ cause, operation: "quit" }),
});

export default Quit;
