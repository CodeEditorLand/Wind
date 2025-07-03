/**
 * @module Command (TypeConverter)
 * @description Implements the CommandConverter. It handles the complex logic
 * of marshalling `vscode.Command` objects, their arguments, and handling command
 * delegation for functions passed as arguments.
 */
import type { IDisposable } from "@codeeditorland/output/vs/base/common/lifecycle.js";
import type { Command as VSCodeCommand } from "vscode";
/**
 * A descriptor for a built-in API command, detailing its signature.
 * Note: The original implementation had more complex types which are simplified
 * here as this converter focuses on delegation.
 */
export declare class APICommand {
    readonly Id: string;
    readonly InternalId: string;
    constructor(Id: string, InternalId: string);
}
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
 * The CommandConverter implementation.
 * This class is responsible for converting `vscode.Command` objects to and from
 * a serializable format for IPC. It also handles a special case for commands
 * that contain functions as arguments by creating temporary, "delegating" commands.
 */
export declare class CommandConverter {
    private readonly RegisterCommand;
    private readonly ExecuteCommand;
    private readonly LookupAPICommand;
    private readonly DelegatingCommandId;
    private readonly DelegatedCommands;
    constructor(RegisterCommand: (Global: boolean, Id: string, Handler: (...Arguments: any[]) => any, ThisArgument?: any) => IDisposable, ExecuteCommand: <T>(Command: string, ...Rest: any[]) => Promise<T | undefined>, LookupAPICommand: (Id: string) => APICommand | undefined);
    private ExecuteDelegatedCommand;
    ToInternal(Command: VSCodeCommand, DisposableArray: IDisposable[]): InternalCommand | undefined;
    FromInternal(CommandDTO: InternalCommand): VSCodeCommand | undefined;
}
//# sourceMappingURL=Command.d.ts.map