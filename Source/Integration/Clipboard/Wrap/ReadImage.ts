import { Effect } from "effect";
import { readImage } from "@tauri-apps/api/clipboard";
import { ClipboardProblem } from "../Error.js";

const ReadImage = Effect.tryPromise({
	try: () => readImage(),
	catch: (cause) => new ClipboardProblem({ cause, operation: "readImage" }),
});

export default ReadImage;

import { Effect } from "effect";
import { readImage } from "@tauri-apps/api/clipboard";
import { ClipboardProblem } from "../Error.js";

const ReadImage = Effect.tryPromise({
	try: () => readImage(),
	catch: (cause) => new ClipboardProblem({ cause, operation: "readImage" }),
});

export default ReadImage;
