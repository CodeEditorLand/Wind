import { Data } from "effect";

export default class Problem extends Data.TaggedError("HostProblem")<{
	readonly cause: unknown;
	readonly operation: string; // Generic operation name
}> {}
