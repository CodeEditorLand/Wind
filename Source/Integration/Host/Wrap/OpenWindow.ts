import { WebviewWindow } from "@tauri-apps/api/window";
import { Effect } from "effect";

import { HostProblem } from "../Error.js";

const OpenWindow = (
	toOpen: any[], // IWindowOpenable[]
	options?: any, // IOpenWindowOptions
): Effect.Effect<void, HostProblem> =>
	Effect.tryPromise({
		try: async () => {
			// This logic would need to be expanded to handle file/folder/workspace URIs
			// and translate them into a URL for the new window.
			const label = `window_${Date.now()}`;
			new WebviewWindow(label, { url: "/" });
		},
		catch: (cause) => new HostProblem({ cause, operation: "openWindow" }),
	});

export default OpenWindow;
