import { Effect, Layer } from "effect";

import type {
	WorkbenchDialogConfirmOptions,
	WorkbenchDialogConfirmResult,
	WorkbenchDialogPickOptions,
	WorkbenchDialogService,
} from "../Interface/WorkbenchDialogService.js";
import { WorkbenchDialogServiceTag } from "../Tag/WorkbenchDialogServiceTag.js";
import type { WorkbenchDialogProblem } from "../Type/WorkbenchDialogProblem.js";
import type {
	WorkbenchDialogBridgeShape,
	WorkbenchDialogGlobals,
} from "./WorkbenchDialogBridgeShape.js";

const ResolveBridge = Effect.sync((): WorkbenchDialogBridgeShape | null => {
	const Globals = globalThis as unknown as WorkbenchDialogGlobals;
	return Globals.__CEL_SERVICES__?.Dialog ?? null;
});

const Unavailable: WorkbenchDialogProblem = {
	_tag: "WorkbenchDialogBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Dialog is null - the workbench has not yet exposed its IDialogService handle.",
};

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

export const WorkbenchDialogLive = Layer.effect(
	WorkbenchDialogServiceTag,

	Effect.gen(function* () {
		const Bridge = yield* ResolveBridge;

		const Confirm = (
			Options: WorkbenchDialogConfirmOptions,
		): Effect.Effect<
			WorkbenchDialogConfirmResult,
			WorkbenchDialogProblem
		> =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				return yield* Effect.tryPromise({
					try: () =>
						Bridge.confirm({
							message: Options.message,
							detail: Options.detail,
							primaryButton: Options.primaryButton,
							cancelButton: Options.cancelButton,
							type: Options.type,
						}),
					catch: (Cause) =>
						({
							_tag: "WorkbenchDialogFailed",
							error: ToError(Cause),
						}) satisfies WorkbenchDialogProblem,
				});
			});

		const Pick = (
			Options: WorkbenchDialogPickOptions,
		): Effect.Effect<number, WorkbenchDialogProblem> =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				const Buttons = Options.choices.map((Label) => ({
					label: Label,
				}));
				const Result = yield* Effect.tryPromise({
					try: () =>
						Bridge.prompt({
							message: Options.message,
							detail: Options.detail,
							buttons: Buttons,
							cancelButton:
								Options.cancelId !== undefined
									? {
											label: Options.choices[
												Options.cancelId
											]!,
										}
									: undefined,
						}),
					catch: (Cause) =>
						({
							_tag: "WorkbenchDialogFailed",
							error: ToError(Cause),
						}) satisfies WorkbenchDialogProblem,
				});
				const Index = Options.choices.findIndex(
					(_, idx) => Result.result === Buttons[idx],
				);
				return Index < 0 ? 0 : Index;
			});

		const Info = (Message: string, Detail?: string) =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				yield* Effect.tryPromise({
					try: () => Bridge.info(Message, Detail),
					catch: (Cause) =>
						({
							_tag: "WorkbenchDialogFailed",
							error: ToError(Cause),
						}) satisfies WorkbenchDialogProblem,
				});
			});

		const ErrorVariant = (Message: string, Detail?: string) =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				yield* Effect.tryPromise({
					try: () => Bridge.error(Message, Detail),
					catch: (Cause) =>
						({
							_tag: "WorkbenchDialogFailed",
							error: ToError(Cause),
						}) satisfies WorkbenchDialogProblem,
				});
			});

		const Service: WorkbenchDialogService = {
			Confirm,
			Pick,
			Info,
			Error: ErrorVariant,
		};

		return Service;
	}),
);

export default WorkbenchDialogLive;
