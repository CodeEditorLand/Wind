/**
 * Commands service interface
 * Microsoft VSCode Reference: ICommandService from vs/platform/commands/common/commands.ts
 */
export interface CommandsService {
	readonly RegisterCommand: (
		id: string,

		handler: (...args: readonly unknown[]) => unknown,
	) => void;

	readonly ExecuteCommand: <T = unknown>(
		id: string,
		...args: readonly unknown[]
	) => Promise<T>;

	readonly UnregisterCommand: (id: string) => void;

	readonly GetCommands: () => Promise<readonly string[]>;
}
