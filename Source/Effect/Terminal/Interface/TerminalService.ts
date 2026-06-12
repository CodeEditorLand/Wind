import type { Effect, Stream } from "effect";

import type { TerminalProblem } from "../Type/TerminalProblem.js";

/**
 * Terminal service interface.
 * Microsoft VSCode Reference: ITerminalService from vs/workbench/contrib/terminal/browser/terminal.ts
 */
export interface TerminalService {

	readonly CreateTerminal: (options?: {
		readonly name?: string;

		readonly shellPath?: string;

		readonly shellArgs?: readonly string[];

		readonly cwd?: string;
	}) => Effect.Effect<
		{ readonly id: number; readonly name: string },

		TerminalProblem
	>;

	readonly SendText: (
		id: number,

		text: string,
	) => Effect.Effect<void, TerminalProblem>;

	readonly Dispose: (id: number) => Effect.Effect<void, TerminalProblem>;

	readonly Show: (
		id: number,

		preserveFocus?: boolean,
	) => Effect.Effect<void, TerminalProblem>;

	readonly Hide: (id: number) => Effect.Effect<void, TerminalProblem>;
}
