import type { Effect, Stream } from "effect";

import type { WorkbenchThemeProblem } from "../Type/WorkbenchThemeProblem.js";

export type WorkbenchThemeKind =
	| "vs"
	| "vs-dark"
	| "hc-black"
	| "hc-light";

export interface WorkbenchThemeDescriptor {
	readonly id: string;
	readonly label: string;
	readonly kind: WorkbenchThemeKind;
}

export interface WorkbenchThemeChangeEvent {
	readonly previous: WorkbenchThemeDescriptor | undefined;
	readonly current: WorkbenchThemeDescriptor;
}

export interface WorkbenchThemeService {
	readonly Active: Effect.Effect<
		WorkbenchThemeDescriptor,
		WorkbenchThemeProblem
	>;

	readonly List: Effect.Effect<
		readonly WorkbenchThemeDescriptor[],
		WorkbenchThemeProblem
	>;

	readonly Apply: (
		themeId: string,
	) => Effect.Effect<void, WorkbenchThemeProblem>;

	readonly Token: (
		key: string,
	) => Effect.Effect<string | undefined, WorkbenchThemeProblem>;

	readonly Changes: Stream.Stream<
		WorkbenchThemeChangeEvent,
		WorkbenchThemeProblem
	>;
}
