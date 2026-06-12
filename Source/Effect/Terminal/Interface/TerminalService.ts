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
	}) => Promise<
		{ readonly id: number; readonly name: string }
	>;

	readonly SendText: (
		id: number,

		text: string,
	) => Promise<void>;

	readonly Dispose: (id: number) => Promise<void>;

	readonly Show: (
		id: number,

		preserveFocus?: boolean,
	) => Promise<void>;

	readonly Hide: (id: number) => Promise<void>;
}
