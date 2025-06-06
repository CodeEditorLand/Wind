import { Data } from "effect";

export default class Problem extends Data.TaggedError("QuickInputProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}
