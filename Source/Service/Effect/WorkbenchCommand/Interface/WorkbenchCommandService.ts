export interface WorkbenchCommandExecutedEvent {
	readonly commandId: string;

	readonly args: ReadonlyArray<unknown>;
}

export interface WorkbenchCommandService {
	readonly Execute: <T = unknown>(
		commandId: string,

		args: ReadonlyArray<unknown>,
	) => Promise<T>;

	readonly ExecuteVoid: (
		commandId: string,

		args: ReadonlyArray<unknown>,
	) => Promise<void>;

	readonly ListIds: () => readonly string[];

	readonly Has: (commandId: string) => boolean;

	readonly OnExecute: (
		callback: (event: WorkbenchCommandExecutedEvent) => void,
	) => { readonly dispose: () => void };
}
