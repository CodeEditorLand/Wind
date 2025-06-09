/*
 * File: Wind/Source/Integration/Clipboard/Wrap/ReadResourceList.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:21 UTC
 * Dependency: ../Convert/PathStringToResourceList.js, ./ReadText.js, effect
 */

import { Effect, pipe } from "effect";
import ReadText from "./ReadText.js";
import ConvertPathStringToResourceList from "../Convert/PathStringToResourceList.js";

const ReadResourceList = pipe(
	ReadText,
	Effect.map(ConvertPathStringToResourceList),
);

export default ReadResourceList;

import { Effect, pipe } from "effect";
import ReadText from "./ReadText.js";
import ConvertPathStringToResourceList from "../Convert/PathStringToResourceList.js";

const ReadResourceList = pipe(
	ReadText,
	Effect.map(ConvertPathStringToResourceList),
);

export default ReadResourceList;
