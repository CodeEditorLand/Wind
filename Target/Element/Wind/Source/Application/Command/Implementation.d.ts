/**
 * @module Implementation (Application/Command)
 * @description The concrete implementation for command conversion and delegation.
 * This class handles the logic of marshalling `vscode.Command` objects and
 * managing delegated commands for IPC transport.
 */
import type { IDisposable } from "vs/base/common/lifecycle.js";
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
export declare class CommandImplementation {
    private readonly CommandService;
    private readonly DelegatingCommandId;
    private readonly DelegatedCommands;
    constructor(CommandService: CommandService);
    private ExecuteDelegatedCommand;
    ToInternal(Command: VSCodeCommand, DisposableArray: IDisposable[]): InternalCommand | undefined;
}
