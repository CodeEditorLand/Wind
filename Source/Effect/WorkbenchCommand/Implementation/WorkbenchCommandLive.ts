import { Effect, Layer, Stream } from "effect";

import type {
	WorkbenchCommandExecutedEvent,
	WorkbenchCommandService,
} from "../Interface/WorkbenchCommandService.js";
import { WorkbenchCommandServiceTag } from "../Tag/WorkbenchCommandServiceTag.js";
import type { WorkbenchCommandProblem } from "../Type/WorkbenchCommandProblem.js";
import type {
	WorkbenchCommandBridgeShape,
	WorkbenchCommandGlobals,
	WorkbenchCommandRegistryShape,
} from "./WorkbenchCommandBridgeShape.js";

const Unavailable: WorkbenchCommandProblem = {
	_tag: "WorkbenchCommandBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Commands is null - the workbench has not yet exposed its ICommandService handle.",
};

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

function makeWorkbenchCommandService(): WorkbenchCommandService {
	const getCommands = (): WorkbenchCommandBridgeShape | null =>
		(globalThis as unknown as WorkbenchCommandGlobals).__CEL_SERVICES__?.Commands ?? null;

	const getRegistry = (): WorkbenchCommandRegistryShape | null =>
		(globalThis as unknown as WorkbenchCommandGlobals).__CEL_SERVICES__?.CommandRegistry ?? null;

	const Execute = <T = unknown>(
		CommandId: string,

		Args: ReadonlyArray<unknown>,
	): Effect.Effect<T, WorkbenchCommandProblem> =>
		Effect.gen(function* () {
			const Commands = getCommands();
			if (!Commands) return yield* Effect.fail(Unavailable);

			const Result = yield* Effect.tryPromise({
				try: () => Commands.executeCommand<T>(CommandId, ...Args),
				catch: (Cause) =>
					({
						_tag: "WorkbenchCommandExecutionFailed",
						commandId: CommandId,
						error: ToError(Cause),
					}) satisfies WorkbenchCommandProblem,
			});

			if (Result === undefined) {
				return yield* Effect.fail<WorkbenchCommandProblem>({
					_tag: "WorkbenchCommandNotFound",
					commandId: CommandId,
				});
			}

			return Result;
		});

	const ExecuteVoid = (
		CommandId: string,

		Args: ReadonlyArray<unknown>,
	): Effect.Effect<void, WorkbenchCommandProblem> =>
		Effect.gen(function* () {
			const Commands = getCommands();
			if (!Commands) return yield* Effect.fail(Unavailable);

			yield* Effect.tryPromise({
				try: () => Commands.executeCommand(CommandId, ...Args),
				catch: (Cause) =>
					({
						_tag: "WorkbenchCommandExecutionFailed",
						commandId: CommandId,
						error: ToError(Cause),
					}) satisfies WorkbenchCommandProblem,
			});
		});

	const ListIds = Effect.gen(function* () {
		const Registry = getRegistry();
		if (!Registry) return yield* Effect.fail(Unavailable);

		return Array.from(Registry.getCommands().keys());
	});

	const Has = (
		CommandId: string,
	): Effect.Effect<boolean, WorkbenchCommandProblem> =>
		Effect.gen(function* () {
			const Registry = getRegistry();
			if (!Registry) return yield* Effect.fail(Unavailable);

			return Registry.getCommand(CommandId) !== undefined;
		});

	const OnExecute = Stream.async<
		WorkbenchCommandExecutedEvent,
		WorkbenchCommandProblem
	>((Emit) => {
		const Commands = getCommands();
		if (!Commands) {
			Emit.fail(Unavailable);

			return Effect.void;
		}

		const Subscription = Commands.onDidExecuteCommand((Event) => {
			Emit.single({ commandId: Event.commandId, args: Event.args });
		});

		return Effect.sync(() => Subscription.dispose());
	});

	return {
		Execute,

		ExecuteVoid,

		ListIds,

		Has,

		OnExecute,
	};
}

export const WorkbenchCommandLive = Layer.succeed(
	WorkbenchCommandServiceTag,

	makeWorkbenchCommandService(),
);

export default WorkbenchCommandLive;
