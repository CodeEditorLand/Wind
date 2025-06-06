import { Data } from "effect";

export default class Problem extends Data.TaggedError("FileSystemProblem")<{
	readonly cause: unknown;
	readonly operation:
		| "stat"
		| "readdir"
		| "readFile"
		| "writeFile"
		| "delete"
		| "rename"
		| "mkdir"
		| "watch"
		| "unwatch";
}> {}
