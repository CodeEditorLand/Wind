import { Effect, Layer, Stream } from "effect";

import type { WorkbenchHostService } from "../Interface/WorkbenchHostService.js";
import type { WorkbenchHostProblem } from "../Type/WorkbenchHostProblem.js";
import type {
	WorkbenchHostBridgeShape,
	WorkbenchHostGlobals,
} from "./WorkbenchHostBridgeShape.js";
import { WorkbenchHostServiceTag } from "../Tag/WorkbenchHostServiceTag.js";

const ResolveBridge = Effect.sync((): WorkbenchHostBridgeShape | null => {
	const Globals = globalThis as unknown as WorkbenchHostGlobals;
	return Globals.__CEL_SERVICES__?.Host ?? null;
});

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

export const WorkbenchHostLive = Layer.effect(
	WorkbenchHostServiceTag,
	Effect.gen(function* () {
		const Bridge = yield* ResolveBridge;

		const Reload: Effect.Effect<void, WorkbenchHostProblem> = Effect.gen(
			function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				yield* Wrap("reload", () => Bridge.reload());
			},
		);

		const Restart: Effect.Effect<void, WorkbenchHostProblem> = Effect.gen(
			function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				yield* Wrap("restart", () => Bridge.restart());
			},
		);

		const Close: Effect.Effect<void, WorkbenchHostProblem> = Effect.gen(
			function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				yield* Wrap("close", () => Bridge.close());
			},
		);

		const Focus: Effect.Effect<void, WorkbenchHostProblem> = Effect.gen(
			function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				yield* Wrap("focus", () => Bridge.focus());
			},
		);

		const OpenWindow = (
			Uris: ReadonlyArray<string>,
		): Effect.Effect<void, WorkbenchHostProblem> =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);
				yield* Wrap("openWindow", () =>
					Bridge.openWindow(
						Uris.map((Value) => ({ uri: { toString: () => Value } })),
					),
				);
			});

		const OnDidChangeFocus = Stream.async<boolean, WorkbenchHostProblem>(
			(Emit) => {
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
	}),
);

export default WorkbenchHostLive;
