// Source/Application/Instantiation/Error.ts
import { Data } from "effect";

// A specific error for when a service cannot be instantiated,
// for example, if its Layer is not provided in the final AppLayer.
export default class Problem extends Data.TaggedError("InstantiationProblem")<{
	readonly ServiceName: string;
	readonly Cause?: unknown;
}> {}
