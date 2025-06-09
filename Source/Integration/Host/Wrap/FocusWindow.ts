/*
 * File: Wind/Source/Integration/Host/Wrap/FocusWindow.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:18 UTC
 * Dependency: ../Error.js, @tauri-apps/api/window, effect
 */

import { appWindow } from "@tauri-apps/api/window";
import { Effect } from "effect";

import { HostProblem } from "../Error.js";

const FocusWindow = (options?: any): Effect.Effect<void, HostProblem> =>
	Effect.tryPromise({
		try: () => appWindow.setFocus(), // Simplified: focuses the current window. A full implementation would handle targetWindowId.
		catch: (cause) => new HostProblem({ cause, operation: "focusWindow" }),
	});

export default FocusWindow;
