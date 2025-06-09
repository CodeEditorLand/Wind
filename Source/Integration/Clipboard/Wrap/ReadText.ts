/*
 * File: Wind/Source/Integration/Clipboard/Wrap/ReadText.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:21 UTC
 * Dependency: ../Error.js, @tauri-apps/api/clipboard, effect
 */

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
