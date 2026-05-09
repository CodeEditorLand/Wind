import type { Effect, Stream } from "effect";

import type { WorkbenchKeybindingProblem } from "../Type/WorkbenchKeybindingProblem.js";

export interface WorkbenchKeybindingResolution {
	readonly commandId: string | null;

	readonly chord: string;

	readonly args: ReadonlyArray<unknown>;
}

export interface WorkbenchKeybindingDispatch {
	readonly chord: string;

	readonly commandId: string | null;

	readonly when: number;
}

export interface WorkbenchKeybindingService {
	readonly Lookup: (
		commandId: string,
	) => Effect.Effect<
		ReadonlyArray<WorkbenchKeybindingResolution>,
		WorkbenchKeybindingProblem
	>;

	readonly Resolve: (
		event: KeyboardEvent,
	) => Effect.Effect<
		WorkbenchKeybindingResolution | null,
		WorkbenchKeybindingProblem
	>;

	readonly Chords: Stream.Stream<
		WorkbenchKeybindingDispatch,
		WorkbenchKeybindingProblem
	>;
}
