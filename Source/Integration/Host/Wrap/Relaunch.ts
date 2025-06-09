/*
 * File: Wind/Source/Integration/Host/Wrap/Relaunch.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:17 UTC
 * Dependency: ../Error.js, @tauri-apps/api/process, effect
 */

import { relaunch } from "@tauri-apps/api/process";
import { Effect } from "effect";

import { HostProblem } from "../Error.js";

const Relaunch = (options?: any): Effect.Effect<void, HostProblem> =>
	Effect.tryPromise({
		try: () => relaunch(),
		catch: (cause) => new HostProblem({ cause, operation: "relaunch" }),
	});

export default Relaunch;
