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

function makeWorkbenchProgressService(): WorkbenchProgressService {
	const Globals = globalThis as unknown as WorkbenchProgressGlobals;

	const Bridge: WorkbenchProgressBridgeShape | null =
		Globals.__CEL_SERVICES__?.Progress ?? null;

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
}

export const WorkbenchProgressLive = Layer.succeed(
	WorkbenchProgressServiceTag,

	makeWorkbenchProgressService(),
);

export default WorkbenchProgressLive;
