import type { Effect } from "effect";

import type { CommandsProblem } from "../Type/CommandsProblem.js";

/**
 * Commands service interface
 * Microsoft VSCode Reference: ICommandService from vs/platform/commands/common/commands.ts
 */
export interface CommandsService {

	readonly RegisterCommand: (
		id: string,

		handler: (...args: readonly unknown[]) => unknown,
	) => Effect.Effect<void, CommandsProblem>;

	readonly ExecuteCommand: <T = unknown>(
		id: string,
		...args: readonly unknown[]
	) => Effect.Effect<T, CommandsProblem>;

	readonly UnregisterCommand: (
		id: string,
	) => Effect.Effect<void, CommandsProblem>;

	readonly GetCommands: () => Effect.Effect<
		readonly string[],

		CommandsProblem
	>;
}
