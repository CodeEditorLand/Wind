import { Data } from "effect";

export default class Problem extends Data.TaggedError("JsonParseProblem")<{
	readonly cause: unknown;
}> {}
