import { Effect } from "effect";
import { writeText } from "@tauri-apps/api/clipboard";
import { ClipboardProblem } from "../Error.js";

const WriteText = (Text: string): Effect.Effect<void, ClipboardProblem> =>
	Effect.tryPromise({
		try: () => writeText(Text),
		catch: (cause) =>
			new ClipboardProblem({ cause, operation: "writeText" }),
	});

export default WriteText;

import { Effect } from "effect";
import { writeText } from "@tauri-apps/api/clipboard";
import { ClipboardProblem } from "../Error.js";

const WriteText = (Text: string): Effect.Effect<void, ClipboardProblem> =>
	Effect.tryPromise({
		try: () => writeText(Text),
		catch: (cause) =>
			new ClipboardProblem({ cause, operation: "writeText" }),
	});

export default WriteText;
