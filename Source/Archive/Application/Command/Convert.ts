/**
 * @module Convert
 * @description
 * Implements the command marshaller. It handles the complex logic of
 * converting `vscode.Command` objects for IPC, including the delegation
 * of commands that have functions as arguments.
 */

import type { IDisposable } from "@codeeditorland/output/vs/base/common/lifecycle.js";
import { generateUuid } from "@codeeditorland/output/vs/base/common/uuid.js";
import type { Command as VSCodeCommand } from "vscode";

import type { Interface as CommandService } from "./Define.js";

/**
 * The Data Transfer Object for a command sent over IPC. It's a serializable
 * representation of a `vscode.Command`.
 */
export interface CommandDTO {
	readonly id: string;
	readonly title: string;
	readonly tooltip?: string;
	readonly arguments?: any[];
}

/**
 * The `MarshalCommand` class handles the conversion of `vscode.Command` objects
 * to and from a serializable format (`CommandDTO`) for IPC transport. It also
 * manages a special case for commands that contain functions as arguments by
 * creating temporary, "delegating" commands that can be invoked from the host.
 */
export class MarshalCommand {
	private readonly _DelegatingCommandID: string;
	private readonly _DelegatedCommands = new Map<string, VSCodeCommand>();

	/**
	 * Constructs a new command marshaller.
	 * @param CommandService The instance of the command service to register and execute commands.
	 */
	constructor(private readonly CommandService: CommandService) {
		this._DelegatingCommandID = `_wind.delegate.${generateUuid()}`;
		this.CommandService.registerCommand(
			false, // Delegated commands are not global.
			this._DelegatingCommandID,
			this.ExecuteDelegated.bind(this),
			this,
		);
	}

	/**
	 * Executes a delegated command that was previously registered.
	 * This is the handler for the internal `_wind.delegate` command.
	 * @param ID The unique ID of the delegated command.
	 * @param ArgumentArray The arguments to pass to the original command.
	 */
	private ExecuteDelegated(ID: string, ...ArgumentArray: any[]): any {
		const Command = this._DelegatedCommands.get(ID);
		if (!Command) {
			throw new Error(`Unknown delegated command: ${ID}`);
		}
		return this.CommandService.executeCommand(
			Command.command,
			...(Command.arguments ?? []),
			...ArgumentArray,
		);
	}

	/**
	 * Converts a `vscode.Command` into a serializable `CommandDTO`.
	 * If the command has functions as arguments, it sets up a delegating command.
	 * @param Command The `vscode.Command` to convert.
	 * @param DisposableArray An array to which a disposable for cleanup will be added.
	 * @returns A `CommandDTO` or `undefined` if the input is undefined.
	 */
	public ToDTO(
		Command: VSCodeCommand,
		DisposableArray: IDisposable[],
	): CommandDTO | undefined {
		if (!Command) {
			return undefined;
		}

		if (
			Array.isArray(Command.arguments) &&
			Command.arguments.some((Argument) => typeof Argument === "function")
		) {
			const ID = generateUuid();
			this._DelegatedCommands.set(ID, Command);
			DisposableArray.push({
				dispose: () => this._DelegatedCommands.delete(ID),
			});
			return {
				id: this._DelegatingCommandID,
				title: Command.title,
				arguments: [ID, ...(Command.arguments ?? [])],
			};
		}

		const Result: CommandDTO = {
			id: Command.command,
			title: Command.title,
			tooltip: Command.tooltip,
			arguments: Command.arguments,
		};

		return Result;
	}
}
