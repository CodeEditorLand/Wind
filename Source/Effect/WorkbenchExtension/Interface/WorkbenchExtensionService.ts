import type { Effect, Stream } from "effect";

import type { WorkbenchExtensionProblem } from "../Type/WorkbenchExtensionProblem.js";

export interface WorkbenchExtensionDescriptor {
	readonly identifier: string;

	readonly version: string;

	readonly displayName: string | null;

	readonly publisher: string | null;

	readonly isBuiltin: boolean;

	readonly extensionLocation: string;
}

export interface WorkbenchExtensionService {
	readonly Snapshot: Effect.Effect<
		ReadonlyArray<WorkbenchExtensionDescriptor>,
		WorkbenchExtensionProblem
	>;

	readonly Activate: (
		extensionId: string,
	) => Effect.Effect<void, WorkbenchExtensionProblem>;

	readonly ActivateByEvent: (
		event: string,
	) => Effect.Effect<void, WorkbenchExtensionProblem>;

	readonly OnExtensionsChange: Stream.Stream<
		ReadonlyArray<WorkbenchExtensionDescriptor>,
		WorkbenchExtensionProblem
	>;
}
