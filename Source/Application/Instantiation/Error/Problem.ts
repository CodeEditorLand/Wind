import { Data } from "effect";

export default class Problem extends Data.TaggedError("InstantiationProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}

import { Data } from "effect";

export default class Problem extends Data.TaggedError("InstantiationProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}
