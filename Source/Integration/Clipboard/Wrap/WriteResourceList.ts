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
