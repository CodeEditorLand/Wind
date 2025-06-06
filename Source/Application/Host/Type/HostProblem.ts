import { Data } from "effect";

export default class Problem extends Data.TaggedError("HostProblem")<{
	readonly cause: unknown;
	readonly operation: "createWebviewWindow";
}> {
	constructor(props: { cause: unknown; operation: "createWebviewWindow" }) {
		super(props);
	}
}
