import type { Effect, Stream } from "effect";

import type { WorkbenchLayoutProblem } from "../Type/WorkbenchLayoutProblem.js";

export type WorkbenchLayoutPart =
	| "ActivityBar"
	| "Sidebar"
	| "Panel"
	| "AuxiliaryBar"
	| "StatusBar"
	| "TitleBar"
	| "Banner";

export interface WorkbenchLayoutSnapshot {
	readonly visible: ReadonlyMap<WorkbenchLayoutPart, boolean>;

	readonly maximized: ReadonlyMap<WorkbenchLayoutPart, boolean>;
}

export interface WorkbenchLayoutChange {
	readonly part: WorkbenchLayoutPart;

	readonly visible: boolean;
}

export interface WorkbenchLayoutService {
	readonly Snapshot: Effect.Effect<
		WorkbenchLayoutSnapshot,
		WorkbenchLayoutProblem
	>;

	readonly SetVisible: (
		part: WorkbenchLayoutPart,

		visible: boolean,
	) => Effect.Effect<void, WorkbenchLayoutProblem>;

	readonly Toggle: (
		part: WorkbenchLayoutPart,
	) => Effect.Effect<void, WorkbenchLayoutProblem>;

	readonly Changes: Stream.Stream<
		WorkbenchLayoutChange,
		WorkbenchLayoutProblem
	>;
}
