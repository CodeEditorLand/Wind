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

const ResolveBridges = Effect.sync(
	(): {
		readonly Commands: WorkbenchCommandBridgeShape | null;

		readonly Registry: WorkbenchCommandRegistryShape | null;
	} => {
		const Globals = globalThis as unknown as WorkbenchCommandGlobals;

		return {
			Commands: Globals.__CEL_SERVICES__?.Commands ?? null,
			Registry: Globals.__CEL_SERVICES__?.CommandRegistry ?? null,
		};
	},
);

const Unavailable: WorkbenchCommandProblem = {
	_tag: "WorkbenchCommandBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Commands is null - the workbench has not yet exposed its ICommandService handle.",
};

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

export const WorkbenchCommandLive = Layer.effect(
	WorkbenchCommandServiceTag,

	Effect.gen(function* () {
		const { Commands, Registry } = yield* ResolveBridges;

		const Execute = <T = unknown>(
			CommandId: string,

			Args: ReadonlyArray<unknown>,
		): Effect.Effect<T, WorkbenchCommandProblem> =>
			Effect.gen(function* () {
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
			if (!Registry) return yield* Effect.fail(Unavailable);

			return Array.from(Registry.getCommands().keys());
		});

		const Has = (
			CommandId: string,
		): Effect.Effect<boolean, WorkbenchCommandProblem> =>
			Effect.gen(function* () {
				if (!Registry) return yield* Effect.fail(Unavailable);

				return Registry.getCommand(CommandId) !== undefined;
			});

		const OnExecute = Stream.async<
			WorkbenchCommandExecutedEvent,
			WorkbenchCommandProblem
		>((Emit) => {
			if (!Commands) {
				Emit.fail(Unavailable);

				return Effect.void;
			}

			const Subscription = Commands.onDidExecuteCommand((Event) => {
				Emit.single({ commandId: Event.commandId, args: Event.args });
			});

			return Effect.sync(() => Subscription.dispose());
		});

		const Service: WorkbenchCommandService = {
			Execute,
			ExecuteVoid,
			ListIds,
			Has,
			OnExecute,
		};

		return Service;
	}),
);

export default WorkbenchCommandLive;
