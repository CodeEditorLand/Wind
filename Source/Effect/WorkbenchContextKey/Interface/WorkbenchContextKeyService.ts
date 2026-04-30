import type { Effect, Stream } from "effect";

import type { WorkbenchContextKeyProblem } from "../Type/WorkbenchContextKeyProblem.js";

export interface WorkbenchContextKeyChangeEvent {
	readonly affectedKeys: ReadonlySet<string>;
}

export interface WorkbenchContextKeyService {
	readonly Get: <T = unknown>(
		key: string,
	) => Effect.Effect<T | undefined, WorkbenchContextKeyProblem>;

	readonly Set: <T>(
		key: string,
		value: T,
	) => Effect.Effect<void, WorkbenchContextKeyProblem>;

	readonly Reset: (
		key: string,
	) => Effect.Effect<void, WorkbenchContextKeyProblem>;

	readonly Match: (
		expression: string,
	) => Effect.Effect<boolean, WorkbenchContextKeyProblem>;

	readonly Changes: Stream.Stream<
		WorkbenchContextKeyChangeEvent,
		WorkbenchContextKeyProblem
	>;
}
