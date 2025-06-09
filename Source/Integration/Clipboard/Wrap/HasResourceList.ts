/*
 * File: Wind/Source/Integration/Clipboard/Wrap/HasResourceList.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:22 UTC
 * Dependency: ../../../Platform/VSCode/Type.js, ./ReadText.js, effect
 */

import { Effect, pipe } from "effect";
import ReadText from "./ReadText.js";
import { Uri } from "../../../Platform/VSCode/Type.js";

const HasResourceList = pipe(
	ReadText,
	Effect.map((ClipboardText) => {
		const LineList = ClipboardText.split("\n");
		if (LineList.length === 0) {
			return false;
		}
		try {
			// A simple heuristic: if the first line can be parsed as a file URI,
			// assume it's a list of resources.
			const TestUri = Uri.file(LineList[0]);
			return TestUri.scheme === "file";
		} catch {
			return false;
		}
	}),
);

export default HasResourceList;

import { Effect, pipe } from "effect";
import ReadText from "./ReadText.js";
import { UriConstructor } from "../../../Platform/VSCode/Type.js";

const HasResourceList = pipe(
	ReadText,
	Effect.map((ClipboardText) => {
		const LineList = ClipboardText.split("\n");
		if (LineList.length === 0 || !LineList[0]) {
			return false;
		}
		try {
			const TestUri = UriConstructor.file(LineList[0]);
			return TestUri.scheme === "file";
		} catch {
			return false;
		}
	}),
);

export default HasResourceList;
