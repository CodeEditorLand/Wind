/*
 * File: Wind/Source/Integration/Host/Wrap/Quit.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:17 UTC
 * Dependency: ../Error.js, @tauri-apps/api/process, effect
 */

import { exit } from "@tauri-apps/api/process";
import { Effect } from "effect";

import { HostProblem } from "../Error.js";

const Quit = Effect.tryPromise({
	try: () => exit(0),
	catch: (cause) => new HostProblem({ cause, operation: "quit" }),
});

export default Quit;
