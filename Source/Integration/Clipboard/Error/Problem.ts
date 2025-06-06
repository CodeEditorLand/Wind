import { Data } from "effect";

export default class Problem extends Data.TaggedError("ClipboardProblem")<{
	readonly cause: unknown;
	readonly operation: "readText" | "writeText" | "readImage" | "writeImage";
}> {}

import { Data } from "effect";

export default class Problem extends Data.TaggedError("ClipboardProblem")<{
	readonly cause: unknown;
	readonly operation: "readText" | "writeText" | "readImage" | "writeImage";
}> {}
