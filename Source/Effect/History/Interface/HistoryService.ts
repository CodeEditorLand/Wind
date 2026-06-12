import type { Effect } from "effect";

import type { HistoryProblem } from "../Type/HistoryProblem.js";

/**
 * Navigation history service interface.
 * Microsoft VSCode Reference: IHistoryService from vs/workbench/services/history/browser/historyService.ts
 *
 * Tracks the editor navigation stack and allows back/forward traversal
 * across recently visited files and cursor positions.
 */
export interface HistoryService {

	/** Navigate to the previous location in the history stack. */
	readonly GoBack: () => Effect.Effect<void, HistoryProblem>;

	/** Navigate to the next location in the history stack. */
	readonly GoForward: () => Effect.Effect<void, HistoryProblem>;

	/** Returns true if there is a previous location to navigate to. */
	readonly CanGoBack: () => Effect.Effect<boolean, HistoryProblem>;

	/** Returns true if there is a next location to navigate to. */
	readonly CanGoForward: () => Effect.Effect<boolean, HistoryProblem>;

	/** Push a new URI onto the navigation stack, clearing forward history. */
	readonly Push: (uri: string) => Effect.Effect<void, HistoryProblem>;

	/** Clear the entire navigation history stack. */
	readonly Clear: () => Effect.Effect<void, HistoryProblem>;

	/** Return the full history stack as a list of URIs (oldest first). */
	readonly GetStack: () => Effect.Effect<readonly string[], HistoryProblem>;
}
