import { appWindow } from "@tauri-apps/api/window";
import { Effect } from "effect";

import { HostProblem } from "../Error.js";

const FocusWindow = (options?: any): Effect.Effect<void, HostProblem> =>
	Effect.tryPromise({
		try: () => appWindow.setFocus(), // Simplified: focuses the current window. A full implementation would handle targetWindowId.
		catch: (cause) => new HostProblem({ cause, operation: "focusWindow" }),
	});

export default FocusWindow;
