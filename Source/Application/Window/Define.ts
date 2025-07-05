/**
 * @module Define
 * @description
 * Defines a placeholder for the `WindowService`. This stub is necessary to
 * satisfy the dependency requirements of the `CommandService` and will be
 * fully implemented in a later step. Its primary role is to provide information
 * about the active text editor.
 */

import { Effect } from "effect";
import type { TextEditor } from "vscode";

/**
 * The contract for the Window service.
 */
export interface Interface {
	/**
	 * The currently active text editor or `undefined`.
	 */
	readonly activeTextEditor: TextEditor | undefined;
}

/**
 * A placeholder `Effect.Service` for the `WindowService`.
 */
export class WindowService extends Effect.Service<Interface>()(
	"Service/Window",
	{
		sync: () => ({
			activeTextEditor: undefined,
		}),
	},
) {}
