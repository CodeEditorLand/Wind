import { Effect, pipe, Runtime } from "effect";
import { Emitter, Event } from "vs/base/common/event.js";
import type {
	ICommandEvent,
	ICommandService,
} from "vs/platform/commands/common/commands.js";

import { CommandRegistryRef, type CommandEffect } from "./Register.js";

class TauriCommandService implements ICommandService {
	readonly _serviceBrand: undefined;

	private readonly _onWillExecuteCommand = new Emitter<ICommandEvent>();
	readonly onWillExecuteCommand: Event<ICommandEvent> =
		this._onWillExecuteCommand.event;

	private readonly _onDidExecuteCommand = new Emitter<ICommandEvent>();
	readonly onDidExecuteCommand: Event<ICommandEvent> =
		this._onDidExecuteCommand.event;

	constructor(private readonly AppRuntime: Runtime.Runtime<any>) {}

	executeCommand<T = any>(commandId: string, ...args: any[]): Promise<T> {
		const ExecuteEffect = Effect.gen(function* (_) {
			const CommandRegistry = yield* _(CommandRegistryRef);
			const Command = CommandRegistry.get(commandId);

			if (!Command) {
				return Promise.reject(
					new Error(`Command '${commandId}' not found.`),
				);
			}

			yield* _(
				Effect.sync(() =>
					this._onWillExecuteCommand.fire({ commandId, args }),
				),
			);

			// The handler itself is an Effect, which we run.
			const Result = yield* _(Command.Handler(...args));

			yield* _(
				Effect.sync(() =>
					this._onDidExecuteCommand.fire({ commandId, args }),
				),
			);

			return Result as T;
		}).pipe(Effect.catchAll((error) => Effect.fail(error)));

		return Runtime.runPromise(this.AppRuntime, ExecuteEffect);
	}
}

const Definition = Effect.map(
	Effect.runtime<any>(),
	(AppRuntime) => new TauriCommandService(AppRuntime),
);
export default Definition;
