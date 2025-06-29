/**
 * @module Implementation (Application/Command)
 * @description The concrete implementation for command conversion and delegation.
 * This class handles the logic of marshalling `vscode.Command` objects and
 * managing delegated commands for IPC transport.
 */

import type { IDisposable } from "vs/base/common/lifecycle.js";
import { generateUuid } from "vs/base/common/uuid.js";
import type { Command as VSCodeCommand } from "vscode";

import { type CommandService } from "./Service.js";

/**
 * Represents the serializable DTO for a command sent over IPC.
 */
export interface InternalCommand {
	id: string;
	title: string;
	tooltip?: string;
	arguments?: any[];
}

/**
 * The CommandImplementation handles the conversion of `vscode.Command` objects
 * to and from a serializable format for IPC. It also manages a special case for
 * commands that contain functions as arguments by creating temporary, "delegating"
 * commands that can be invoked from the host.
 */
export class CommandImplementation {
	private readonly DelegatingCommandId: string;
	private readonly DelegatedCommands = new Map<string, VSCodeCommand>();

	constructor(private readonly CommandService: CommandService) {
		this.DelegatingCommandId = `_wind.delegate.${generateUuid()}`;
		this.CommandService.registerCommand(
			false, // Delegated commands are not global.
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
		return this.CommandService.executeCommand(
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
}
