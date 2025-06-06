import { ask, confirm, message } from "@tauri-apps/api/dialog";
import { Effect, pipe } from "effect";

import { HostProblem } from "../Error.js";

const ShowMessageBox = (
	options: any, // MessageBoxOptions
): Effect.Effect<any, HostProblem> =>
	Effect.tryPromise({
		try: async () => {
			const { buttons, message: msg, detail, type } = options;
			// This is a simplified mapping. A full implementation would need to handle
			// custom button labels and return the correct button index.
			if (type === "question" && buttons && buttons.length > 1) {
				const result = await ask(detail || msg, {
					title: msg,
					type: "info",
				});
				return { response: result ? 0 : 1 }; // Map true/false to button index
			} else {
				await message(detail || msg, { title: msg, type: "info" });
				return { response: 0 };
			}
		},
		catch: (cause) =>
			new HostProblem({ cause, operation: "showMessageBox" }),
	});

export default ShowMessageBox;
