import type { Effect } from "effect";

import type { WorkbenchClipboardProblem } from "../Type/WorkbenchClipboardProblem.js";

export interface WorkbenchClipboardService {
	readonly ReadText: Effect.Effect<string, WorkbenchClipboardProblem>;
	readonly WriteText: (
		value: string,
	) => Effect.Effect<void, WorkbenchClipboardProblem>;
	readonly ReadResources: Effect.Effect<
		ReadonlyArray<string>,
		WorkbenchClipboardProblem
	>;
	readonly WriteResources: (
		uris: ReadonlyArray<string>,
	) => Effect.Effect<void, WorkbenchClipboardProblem>;
}
