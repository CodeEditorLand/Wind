/*
 * File: Wind/Source/Integration/Host/Wrap/Lifecycle.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:17 UTC
 * Dependency: ../Error.js, @tauri-apps/api/process, effect
 * Export: ExitApplication
 */

import { exit } from "@tauri-apps/api/process";
import { Effect } from "effect";

import { HostProblem } from "../Error.js";

export const ExitApplication = Effect.tryPromise({
	try: () => exit(0),
	catch: (cause) => new HostProblem({ cause, operation: "exit" }),
});
