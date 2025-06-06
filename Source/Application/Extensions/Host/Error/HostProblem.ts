// Source/Application/Extensions/Host/Error/HostProblem.ts
import { Data } from "effect";

export class HostStartProblem extends Data.TaggedError("HostStartProblem")<{
	readonly cause: unknown;
	readonly options: unknown; // For debugging, include the options that failed
}> {}

export class HostShutdownProblem extends Data.TaggedError(
	"HostShutdownProblem",
)<{
	readonly cause: unknown;
	readonly context: "GracefulShutdownTimeout";
}> {}

export class UnknownHostProblem extends Data.TaggedError("UnknownHostProblem")<{
	readonly hostId: string;
}> {}

export type HostProblem =
	| HostStartProblem
	| HostShutdownProblem
	| UnknownHostProblem;
