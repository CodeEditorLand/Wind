import type { Effect } from "effect";

export type CommandsProblem =
	| { readonly _tag: "CommandsNotAvailable"; readonly reason: string }

	| { readonly _tag: "CommandsOperationFailed"; readonly error: Error }

	| {

			readonly _tag: "CommandsInvalidArgument";

			readonly argument: string;

			readonly reason: string;
	  };
