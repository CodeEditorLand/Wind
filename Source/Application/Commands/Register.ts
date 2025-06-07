import { Effect } from "effect";

import { CommandRegistryRef } from "./Ref.js";

export type CommandEffect<Argument extends any[], R> = (
	...args: Argument
) => Effect.Effect<R, any, any>;

interface ICommand<Argument extends any[], R> {
	Id: string;
	Handler: CommandEffect<Argument, R>;
}

const RegisterCommand = <Argument extends any[], R>(
	Command: ICommand<Argument, R>,
): Effect.Effect<void, never, Ref.Ref<Map<string, CommandEffect<any, any>>>> =>
	Effect.flatMap(CommandRegistryRef, (Registry) =>
		Ref.update(Registry, (map) => map.set(Command.Id, Command.Handler)),
	);

export default RegisterCommand;
