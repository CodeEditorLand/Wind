import type { Effect, Stream } from "effect";

import type { WorkbenchHostProblem } from "../Type/WorkbenchHostProblem.js";

export interface WorkbenchHostService {
	readonly Reload: Effect.Effect<void, WorkbenchHostProblem>;
	readonly Restart: Effect.Effect<void, WorkbenchHostProblem>;
	readonly Close: Effect.Effect<void, WorkbenchHostProblem>;
	readonly Focus: Effect.Effect<void, WorkbenchHostProblem>;
	readonly OpenWindow: (
		uris: ReadonlyArray<string>,
	) => Effect.Effect<void, WorkbenchHostProblem>;
	readonly OnDidChangeFocus: Stream.Stream<boolean, WorkbenchHostProblem>;
}
