import { Effect } from "effect";

import { CommandRegistryRef } from "./Ref.js";

export type CommandEffect<Args extends any[], R> = (
	...args: Args
) => Effect.Effect<R, any, any>;

interface ICommand<Args extends any[], R> {
	Id: string;
	Handler: CommandEffect<Args, R>;
}

const RegisterCommand = <Args extends any[], R>(
	Command: ICommand<Args, R>,
): Effect.Effect<void, never, Ref.Ref<Map<string, CommandEffect<any, any>>>> =>
	Effect.flatMap(CommandRegistryRef, (Registry) =>
		Ref.update(Registry, (map) => map.set(Command.Id, Command.Handler)),
	);

export default RegisterCommand;
