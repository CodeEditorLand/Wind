import { Effect } from "effect";
import { readText } from "@tauri-apps/api/clipboard";
import { ClipboardProblem } from "../Error.js";

const ReadText = Effect.tryPromise({
	try: () => readText(),
	catch: (cause) => new ClipboardProblem({ cause, operation: "readText" }),
});

export default ReadText;

import { Effect } from "effect";
import { readText } from "@tauri-apps/api/clipboard";
import { ClipboardProblem } from "../Error.js";

const ReadText = Effect.tryPromise({
	try: () => readText(),
	catch: (cause) => new ClipboardProblem({ cause, operation: "readText" }),
});

export default ReadText;
