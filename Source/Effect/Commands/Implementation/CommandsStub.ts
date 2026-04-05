import { Effect } from "effect";
import type { CommandsService } from "../Interface/CommandsService.js";

export const StubCommandsService: CommandsService = {
	RegisterCommand: (_id, _handler) => Effect.void,
	ExecuteCommand: <T = unknown>(_id: string, ..._args: readonly unknown[]) =>
		Effect.succeed(undefined as T),
	UnregisterCommand: (_id) => Effect.void,
	GetCommands: () => Effect.succeed([]),
};

export default StubCommandsService;
