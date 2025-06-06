import { Data } from "effect";

export default class Problem extends Data.TaggedError("StorageProblem")<{
	readonly cause: unknown;
	readonly operation: "initialize" | "get" | "set" | "remove" | "keys";
}> {
	constructor(props: {
		cause: unknown;
		operation: "initialize" | "get" | "set" | "remove" | "keys";
	}) {
		super(props);
	}
}
