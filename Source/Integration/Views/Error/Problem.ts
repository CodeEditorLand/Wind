import { Data } from "effect";

export default class Problem extends Data.TaggedError("ViewStateProblem")<{
	readonly cause: unknown;
	readonly operation: "fetch" | "store";
}> {}
