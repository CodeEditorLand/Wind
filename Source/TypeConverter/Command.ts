/**
 * @module Command (TypeConverter)
 * @description Implements the CommandConverter. It handles the complex logic
 * of marshalling `vscode.Command` objects, their arguments, and handling command
 * delegation for functions passed as arguments.
 */

import type { IDisposable } from "vs/base/common/lifecycle.js";
import { generateUuid } from "vs/base/common/uuid.js";
import type { Command as VSCodeCommand } from "vscode";

/**
 * A descriptor for a built-in API command, detailing its signature.
 * Note: The original implementation had more complex types which are simplified
 * here as this converter focuses on delegation.
 */
export class APICommand {
	constructor(
		public readonly Id: string,
		public readonly InternalId: string,
	) {}
}

/**
 * Represents the serializable DTO for a command sent over IPC.
 */
interface InternalCommand {
	id: string;
	title: string;
	tooltip?: string;
	arguments?: any[];
}

/**
 * The CommandConverter implementation.
 * This class is responsible for converting `vscode.Command` objects to and from
 * a serializable format for IPC. It also handles a special case for commands
 * that contain functions as arguments by creating temporary, "delegating" commands.
 */
export class CommandConverter {
	private readonly DelegatingCommandId: string;
	private readonly DelegatedCommands = new Map<string, VSCodeCommand>();

	constructor(
		private readonly RegisterCommand: (
			Global: boolean,
			Id: string,
			Handler: (...Arguments: any[]) => any,
			ThisArgument?: any,
		) => IDisposable,
		private readonly ExecuteCommand: <T>(
			Command: string,
			...Rest: any[]
		) => Promise<T | undefined>,
		private readonly LookupAPICommand: (
			Id: string,
		) => APICommand | undefined,
	) {
		this.DelegatingCommandId = `_wind.delegate.${generateUuid()}`;
		this.RegisterCommand(
			false, // Delegated commands are internal, not global.
			this.DelegatingCommandId,
			this.ExecuteDelegatedCommand.bind(this),
			this,
		);
	}

	private ExecuteDelegatedCommand(Id: string, ...ArgumentArray: any[]): any {
		const Command = this.DelegatedCommands.get(Id);
		if (!Command) {
			throw new Error(`Unknown delegated command: ${Id}`);
		}
		return this.ExecuteCommand(
			Command.command,
			...(Command.arguments ?? []),
			...ArgumentArray,
		);
	}

	public ToInternal(
		Command: VSCodeCommand,
		DisposableArray: IDisposable[],
	): InternalCommand | undefined {
		if (!Command) {
			return undefined;
		}

		const APICommandValue = this.LookupAPICommand(Command.command);
		if (APICommandValue) {
			return {
				id: APICommandValue.InternalId,
				title: Command.title,
				arguments: Command.arguments,
			};
		}

		if (
			Array.isArray(Command.arguments) &&
			Command.arguments.some((Argument) => typeof Argument === "function")
		) {
			const Id = generateUuid();
			this.DelegatedCommands.set(Id, Command);
			DisposableArray.push({
				dispose: () => this.DelegatedCommands.delete(Id),
			});
			return {
				id: this.DelegatingCommandId,
				title: Command.title,
				arguments: [Id, ...(Command.arguments ?? [])],
			};
		}

		const Result: InternalCommand = {
			id: Command.command,
			title: Command.title,
		};
		if (Command.tooltip) {
			Result.tooltip = Command.tooltip;
		}
		if (Command.arguments) {
			Result.arguments = Command.arguments;
		}
		return Result;
	}

	public FromInternal(
		CommandDTO: InternalCommand,
	): VSCodeCommand | undefined {
		if (!CommandDTO) {
			return undefined;
		}
		const Result: VSCodeCommand = {
			command: CommandDTO.id,
			title: CommandDTO.title,
		};
		if (CommandDTO.tooltip) {
			Result.tooltip = CommandDTO.tooltip;
		}
		if (CommandDTO.arguments) {
			Result.arguments = CommandDTO.arguments;
		}
		return Result;
	}
}
