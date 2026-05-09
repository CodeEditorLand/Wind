import type { Effect, Stream } from "effect";

import type { WorkbenchCommandProblem } from "../Type/WorkbenchCommandProblem.js";

export interface WorkbenchCommandExecutedEvent {
	readonly commandId: string;

	readonly args: ReadonlyArray<unknown>;
}

export interface WorkbenchCommandService {
	readonly Execute: <T = unknown>(
		commandId: string,

		args: ReadonlyArray<unknown>,
	) => Effect.Effect<T, WorkbenchCommandProblem>;

	readonly ExecuteVoid: (
		commandId: string,

		args: ReadonlyArray<unknown>,
	) => Effect.Effect<void, WorkbenchCommandProblem>;

	readonly ListIds: Effect.Effect<readonly string[], WorkbenchCommandProblem>;

	readonly Has: (
		commandId: string,
	) => Effect.Effect<boolean, WorkbenchCommandProblem>;

	readonly OnExecute: Stream.Stream<
		WorkbenchCommandExecutedEvent,
		WorkbenchCommandProblem
	>;
}
