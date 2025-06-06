import { Data } from "effect";

export default class Problem extends Data.TaggedError("NotificationProblem")<{
	readonly cause: unknown;
	readonly context: string;
}> {}
