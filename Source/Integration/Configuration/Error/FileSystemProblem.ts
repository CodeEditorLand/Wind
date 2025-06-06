import { Data } from "effect";

export default class Problem extends Data.TaggedError("FileSystemProblem")<{
	readonly cause: unknown;
	readonly path: string;
}> {}
