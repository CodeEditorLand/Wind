import { Effect, Layer } from "effect";

import type {
	WorkbenchProgressReporter,
	WorkbenchProgressService,
	WorkbenchProgressTaskOptions,
} from "../Interface/WorkbenchProgressService.js";
import { WorkbenchProgressServiceTag } from "../Tag/WorkbenchProgressServiceTag.js";
import type { WorkbenchProgressProblem } from "../Type/WorkbenchProgressProblem.js";
import {
	WorkbenchProgressLocationCode,
	type UpstreamProgressReporter,
	type WorkbenchProgressBridgeShape,
	type WorkbenchProgressGlobals,
} from "./WorkbenchProgressBridgeShape.js";

const ResolveBridge = Effect.sync((): WorkbenchProgressBridgeShape | null => {
	const Globals = globalThis as unknown as WorkbenchProgressGlobals;
	return Globals.__CEL_SERVICES__?.Progress ?? null;
});

const Unavailable: WorkbenchProgressProblem = {
	_tag: "WorkbenchProgressBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Progress is null.",
};

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

const ToReporter = (
	upstream: UpstreamProgressReporter,
): WorkbenchProgressReporter => ({
	Report: (Fraction, Message) =>
		Effect.sync(() =>
			upstream.report({
				increment: Math.round(Fraction * 100),
				message: Message,
			}),
		),
});

export const WorkbenchProgressLive = Layer.effect(
	WorkbenchProgressServiceTag,

	Effect.gen(function* () {
		const Bridge = yield* ResolveBridge;

		const Run = <A>(
			Options: WorkbenchProgressTaskOptions,

			Body: (
				reporter: WorkbenchProgressReporter,
			) => Effect.Effect<A, WorkbenchProgressProblem>,
		): Effect.Effect<A, WorkbenchProgressProblem> =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				return yield* Effect.tryPromise({
					try: () =>
						Bridge.withProgress(
							{
								title: Options.title,
								location: WorkbenchProgressLocationCode(
									Options.location,
								),
								cancellable: Options.cancellable,
								source: Options.source,
							},

							async (Reporter) =>
								Effect.runPromise(Body(ToReporter(Reporter))),
						),
					catch: (Cause) =>
						({
							_tag: "WorkbenchProgressTaskFailed",
							title: Options.title,
							error: ToError(Cause),
						}) satisfies WorkbenchProgressProblem,
				});
			});

		const Service: WorkbenchProgressService = { Run };
		return Service;
	}),
);

export default WorkbenchProgressLive;
