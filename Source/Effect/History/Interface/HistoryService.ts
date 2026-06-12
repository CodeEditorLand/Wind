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
	readonly GoBack: () => Promise<void>;

	/** Navigate to the next location in the history stack. */
	readonly GoForward: () => Promise<void>;

	/** Returns true if there is a previous location to navigate to. */
	readonly CanGoBack: () => Promise<boolean>;

	/** Returns true if there is a next location to navigate to. */
	readonly CanGoForward: () => Promise<boolean>;

	/** Push a new URI onto the navigation stack, clearing forward history. */
	readonly Push: (uri: string) => Promise<void>;

	/** Clear the entire navigation history stack. */
	readonly Clear: () => Promise<void>;

	/** Return the full history stack as a list of URIs (oldest first). */
	readonly GetStack: () => Promise<readonly string[]>;
}
