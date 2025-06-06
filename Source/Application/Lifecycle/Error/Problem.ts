import { Data } from "effect";

export default class Problem extends Data.TaggedError("LifecycleProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}
