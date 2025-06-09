/*
 * File: Wind/Source/Integration/Clipboard/Wrap/ReadImage.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:21 UTC
 * Dependency: ../Error.js, @tauri-apps/api/clipboard, effect
 */

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
