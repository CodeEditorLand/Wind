import type {
	WorkbenchCommandExecutedEvent,
	WorkbenchCommandService,
} from "../Interface/WorkbenchCommandService.js";

import { WorkbenchCommandError } from "../Type/WorkbenchCommandProblem.js";

import type {
	WorkbenchCommandBridgeShape,
	WorkbenchCommandGlobals,
	WorkbenchCommandRegistryShape,
} from "./WorkbenchCommandBridgeShape.js";

const Unavailable = (): WorkbenchCommandError =>
	new WorkbenchCommandError({
		_tag: "WorkbenchCommandBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Commands is null - the workbench has not yet exposed its ICommandService handle.",
	});

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

function makeWorkbenchCommandService(): WorkbenchCommandService {
	const getCommands = (): WorkbenchCommandBridgeShape | null =>
		(globalThis as unknown as WorkbenchCommandGlobals).__CEL_SERVICES__
			?.Commands ?? null;

	const getRegistry = (): WorkbenchCommandRegistryShape | null =>
		(globalThis as unknown as WorkbenchCommandGlobals).__CEL_SERVICES__
			?.CommandRegistry ?? null;

	const Execute = async <T = unknown>(
		CommandId: string,

		Args: ReadonlyArray<unknown>,
	): Promise<T> => {
		const Commands = getCommands();

		if (!Commands) throw Unavailable();

		let Result: T | undefined;

		try {
			Result = await Commands.executeCommand<T>(CommandId, ...Args);
		} catch (Cause) {
			throw new WorkbenchCommandError({
				_tag: "WorkbenchCommandExecutionFailed",
				commandId: CommandId,
				error: ToError(Cause),
			});
		}

		if (Result === undefined) {
			throw new WorkbenchCommandError({
				_tag: "WorkbenchCommandNotFound",
				commandId: CommandId,
			});
		}

		return Result;
	};

	const ExecuteVoid = async (
		CommandId: string,

		Args: ReadonlyArray<unknown>,
	): Promise<void> => {
		const Commands = getCommands();

		if (!Commands) throw Unavailable();

		try {
			await Commands.executeCommand(CommandId, ...Args);
		} catch (Cause) {
			throw new WorkbenchCommandError({
				_tag: "WorkbenchCommandExecutionFailed",
				commandId: CommandId,
				error: ToError(Cause),
			});
		}
	};

	const ListIds = (): readonly string[] => {
		const Registry = getRegistry();

		if (!Registry) throw Unavailable();

		return Array.from(Registry.getCommands().keys());
	};

	const Has = (CommandId: string): boolean => {
		const Registry = getRegistry();

		if (!Registry) throw Unavailable();

		return Registry.getCommand(CommandId) !== undefined;
	};

	const OnExecute = (
		Callback: (event: WorkbenchCommandExecutedEvent) => void,
	): { readonly dispose: () => void } => {
		const Commands = getCommands();

		if (!Commands) throw Unavailable();

		return Commands.onDidExecuteCommand((Event) => {
			Callback({ commandId: Event.commandId, args: Event.args });
		});
	};

	return {
		Execute,

		ExecuteVoid,

		ListIds,

		Has,

		OnExecute,
	};
}

export const WorkbenchCommandLive = makeWorkbenchCommandService();

export default WorkbenchCommandLive;
