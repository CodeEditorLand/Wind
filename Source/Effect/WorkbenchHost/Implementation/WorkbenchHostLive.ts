import { Effect, Layer, Stream } from "effect";

import type { WorkbenchHostService } from "../Interface/WorkbenchHostService.js";
import { WorkbenchHostServiceTag } from "../Tag/WorkbenchHostServiceTag.js";
import type { WorkbenchHostProblem } from "../Type/WorkbenchHostProblem.js";
import type {
	WorkbenchHostBridgeShape,
	WorkbenchHostGlobals,
} from "./WorkbenchHostBridgeShape.js";

const Unavailable: WorkbenchHostProblem = {
	_tag: "WorkbenchHostBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Host is null.",
};

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

const Wrap = <A>(
	Operation: string,

	Run: () => Promise<A>,
): Effect.Effect<A, WorkbenchHostProblem> =>
	Effect.tryPromise({
		try: Run,
		catch: (Cause) =>
			({
				_tag: "WorkbenchHostOperationFailed",
				operation: Operation,
				error: ToError(Cause),
			}) satisfies WorkbenchHostProblem,
	});

function makeWorkbenchHostService(): WorkbenchHostService {
	const getBridge = (): WorkbenchHostBridgeShape | null =>
		(globalThis as unknown as WorkbenchHostGlobals).__CEL_SERVICES__
			?.Host ?? null;

	const Reload: Effect.Effect<void, WorkbenchHostProblem> = Effect.gen(
		function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			yield* Wrap("reload", () => Bridge.reload());
		},
	);

	const Restart: Effect.Effect<void, WorkbenchHostProblem> = Effect.gen(
		function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			yield* Wrap("restart", () => Bridge.restart());
		},
	);

	const Close: Effect.Effect<void, WorkbenchHostProblem> = Effect.gen(
		function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			yield* Wrap("close", () => Bridge.close());
		},
	);

	const Focus: Effect.Effect<void, WorkbenchHostProblem> = Effect.gen(
		function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			yield* Wrap("focus", () => Bridge.focus());
		},
	);

	const OpenWindow = (
		Uris: ReadonlyArray<string>,
	): Effect.Effect<void, WorkbenchHostProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			yield* Wrap("openWindow", () =>
				Bridge.openWindow(
					Uris.map((Value) => ({
						uri: { toString: () => Value },
					})),
				),
			);
		});

	const OnDidChangeFocus = Stream.async<boolean, WorkbenchHostProblem>(
		(Emit) => {
			const Bridge = getBridge();

			if (!Bridge?.onDidChangeFocus) {
				Emit.fail(Unavailable);

				return Effect.void;
			}

			const Subscription = Bridge.onDidChangeFocus((Focused) =>
				Emit.single(Focused),
			);

			return Effect.sync(() => Subscription.dispose());
		},
	);

	const Service: WorkbenchHostService = {
		Reload,

		Restart,

		Close,

		Focus,

		OpenWindow,

		OnDidChangeFocus,
	};

	return Service;
}

export const WorkbenchHostLive = Layer.succeed(
	WorkbenchHostServiceTag,

	makeWorkbenchHostService(),
);

export default WorkbenchHostLive;
