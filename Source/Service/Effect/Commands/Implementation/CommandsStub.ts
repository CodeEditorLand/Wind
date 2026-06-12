2|
3|import type { CommandsService } from "../Interface/CommandsService.js";

4|
5|export const StubCommandsService: CommandsService = {

6|	RegisterCommand: (_id, _handler) => Effect.void,

7|
8|	ExecuteCommand: <T = unknown>(_id: string, ..._args: readonly unknown[]) =>
9|		Effect.succeed(undefined as T),

10|
11|	UnregisterCommand: (_id) => Effect.void,

12|
13|	GetCommands: () => Effect.succeed([]),

14|};

15|
16|export default StubCommandsService;

17|
