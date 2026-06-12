import { Effect } from "effect";

import type { WorkbenchClipboardService } from "../Interface/WorkbenchClipboardService.js";
import type { WorkbenchClipboardProblem } from "../Type/WorkbenchClipboardProblem.js";
import type {
	WorkbenchClipboardBridgeShape,
	WorkbenchClipboardGlobals,
} from "./WorkbenchClipboardBridgeShape.js";

const Unavailable: WorkbenchClipboardProblem = {
	_tag: "WorkbenchClipboardBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Clipboard is null.",
};

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

function makeWorkbenchClipboardService(): WorkbenchClipboardService {
	const getBridge = (): WorkbenchClipboardBridgeShape | null =>
		(globalThis as unknown as WorkbenchClipboardGlobals).__CEL_SERVICES__
			?.Clipboard ?? null;

	const ReadText: Effect.Effect<string, WorkbenchClipboardProblem> =
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			return yield* Effect.tryPromise({
				try: () => Bridge.readText(),
				catch: (Cause) =>
					({
						_tag: "WorkbenchClipboardReadFailed",
						error: ToError(Cause),
					}) satisfies WorkbenchClipboardProblem,
			});
		});

	const WriteText = (
		Value: string,
	): Effect.Effect<void, WorkbenchClipboardProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			yield* Effect.tryPromise({
				try: () => Bridge.writeText(Value),
				catch: (Cause) =>
					({
						_tag: "WorkbenchClipboardWriteFailed",
						error: ToError(Cause),
					}) satisfies WorkbenchClipboardProblem,
			});
		});

	const ReadResources: Effect.Effect<
		ReadonlyArray<string>,
		WorkbenchClipboardProblem
	> = Effect.gen(function* () {
		const Bridge = getBridge();

		if (!Bridge) return yield* Effect.fail(Unavailable);

		const Resources = yield* Effect.tryPromise({
			try: () => Bridge.readResources(),
			catch: (Cause) =>
				({
					_tag: "WorkbenchClipboardReadFailed",
					error: ToError(Cause),
				}) satisfies WorkbenchClipboardProblem,
		});

		return Resources.map((Uri) => Uri.toString());
	});

	const WriteResources = (
		Uris: ReadonlyArray<string>,
	): Effect.Effect<void, WorkbenchClipboardProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			const ToShim = Uris.map(
				(Value) =>
					({ toString: () => Value }) as {
						readonly toString: () => string;
					},
			);

			yield* Effect.tryPromise({
				try: () => Bridge.writeResources(ToShim),
				catch: (Cause) =>
					({
						_tag: "WorkbenchClipboardWriteFailed",
						error: ToError(Cause),
					}) satisfies WorkbenchClipboardProblem,
			});
		});

	return {
		ReadText,

		WriteText,

		ReadResources,

		WriteResources,
	};
}

export const WorkbenchClipboardLive = makeWorkbenchClipboardService();

export default WorkbenchClipboardLive;
