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
