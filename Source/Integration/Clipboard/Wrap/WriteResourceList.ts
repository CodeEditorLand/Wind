/*
 * File: Wind/Source/Integration/Clipboard/Wrap/WriteResourceList.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:21 UTC
 * Dependency: ../../../Platform/VSCode/Type.js, ../Convert/ResourceListToPathString.js, ./WriteText.js, effect
 */

import { Effect, pipe } from "effect";
import type { Uri } from "../../../Platform/VSCode/Type.js";
import ConvertResourceListToPathString from "../Convert/ResourceListToPathString.js";
import WriteText from "./WriteText.js";

const WriteResourceList = (
	ResourceList: readonly Uri[],
): Effect.Effect<void, import("../Error.js").ClipboardProblem> =>
	pipe(ResourceList, ConvertResourceListToPathString, (PathString) =>
		WriteText(PathString),
	);

export default WriteResourceList;

import { Effect, pipe } from "effect";
import type { Uri } from "../../../Platform/VSCode/Type.js";
import ConvertResourceListToPathString from "../Convert/ResourceListToPathString.js";
import WriteText from "./WriteText.js";

const WriteResourceList = (
	ResourceList: readonly Uri[],
): Effect.Effect<void, import("../Error.js").ClipboardProblem> =>
	pipe(ResourceList, ConvertResourceListToPathString, (PathString) =>
		WriteText(PathString),
	);

export default WriteResourceList;
