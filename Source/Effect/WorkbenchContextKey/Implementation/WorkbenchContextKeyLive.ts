import { Effect, Layer, Stream } from "effect";

import type {
	WorkbenchContextKeyChangeEvent,
	WorkbenchContextKeyService,
} from "../Interface/WorkbenchContextKeyService.js";
import { WorkbenchContextKeyServiceTag } from "../Tag/WorkbenchContextKeyServiceTag.js";
import type { WorkbenchContextKeyProblem } from "../Type/WorkbenchContextKeyProblem.js";
import type {
	WorkbenchContextKeyBridgeShape,
	WorkbenchContextKeyGlobals,
} from "./WorkbenchContextKeyBridgeShape.js";

const ResolveBridge = Effect.sync((): WorkbenchContextKeyBridgeShape | null => {
	const Globals = globalThis as unknown as WorkbenchContextKeyGlobals;

	return Globals.__CEL_SERVICES__?.ContextKey ?? null;
});

const Unavailable: WorkbenchContextKeyProblem = {
	_tag: "WorkbenchContextKeyBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.ContextKey is null.",
};

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

export const WorkbenchContextKeyLive = Layer.effect(
	WorkbenchContextKeyServiceTag,

	Effect.gen(function* () {
		const Bridge = yield* ResolveBridge;

		const Get = <T = unknown>(
			Key: string,
		): Effect.Effect<T | undefined, WorkbenchContextKeyProblem> =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);

				return Bridge.getContextKeyValue<T>(Key);
			});

		const Set = <T>(
			Key: string,

			Value: T,
		): Effect.Effect<void, WorkbenchContextKeyProblem> =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);

				Bridge.createKey<T>(Key, undefined).set(Value);
			});

		const Reset = (
			Key: string,
		): Effect.Effect<void, WorkbenchContextKeyProblem> =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);

				Bridge.createKey(Key, undefined).reset();
			});

		const Match = (
			Expression: string,
		): Effect.Effect<boolean, WorkbenchContextKeyProblem> =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);

				return yield* Effect.try({
					try: () => Bridge.contextMatchesRules(Expression),
					catch: (Cause) =>
						({
							_tag: "WorkbenchContextKeyEvalFailed",
							expression: Expression,
							error: ToError(Cause),
						}) satisfies WorkbenchContextKeyProblem,
				});
			});

		const Changes = Stream.async<
			WorkbenchContextKeyChangeEvent,
			WorkbenchContextKeyProblem
		>((Emit) => {
			if (!Bridge) {
				Emit.fail(Unavailable);

				return Effect.void;
			}

			const Subscription = Bridge.onDidChangeContext((Event) => {
				Emit.single({ affectedKeys: Event.keys ?? new Set() });
			});

			return Effect.sync(() => Subscription.dispose());
		});

		const Service: WorkbenchContextKeyService = {
			Get,
			Set,
			Reset,
			Match,
			Changes,
		};

		return Service;
	}),
);

export default WorkbenchContextKeyLive;
