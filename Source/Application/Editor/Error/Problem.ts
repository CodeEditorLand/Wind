import { Data } from "effect";

export default class Problem extends Data.TaggedError("EditorProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}
