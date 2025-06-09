/*
 * File: Wind/Source/Integration/Clipboard/Wrap/WriteText.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:21 UTC
 * Dependency: ../Error.js, @tauri-apps/api/clipboard, effect
 */

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
