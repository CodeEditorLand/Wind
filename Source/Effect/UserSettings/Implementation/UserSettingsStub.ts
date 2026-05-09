/**
 * @module Effect/UserSettings/Implementation/UserSettingsStub
 * @description
 * In-memory stub backing for tests / headless contexts where the
 * workbench bridge isn't reachable. Reads go straight to the
 * `__CEL_OVERRIDE_CONFIG__`-shaped internal map; writes update the
 * map and emit a `Changes` event.
 *
 * The Live implementation in `UserSettingsLive.ts` is the one used
 * at runtime; this stub is for unit tests and for the early-boot
 * window before `__CEL_SERVICES__.Configuration` is populated.
 * @category Implementation
 */

import { Effect, Stream, SubscriptionRef } from "effect";

import type {
	UserSettingsChangeEvent,
	UserSettingsService,
	UserSettingsTarget,
} from "../Interface/UserSettingsService.js";

const InitialState: ReadonlyMap<string, unknown> = new Map();

export const MakeUserSettingsStub = Effect.gen(function* () {
	const State =
		yield* SubscriptionRef.make<ReadonlyMap<string, unknown>>(InitialState);
	const ChangesQueue = yield* Effect.acquireRelease(
		Effect.sync(() => new Set<UserSettingsChangeEvent>()),

		(set) => Effect.sync(() => set.clear()),
	);

	const Service: UserSettingsService = {
		Read: (Section) =>
			Effect.gen(function* () {
				const Map = yield* SubscriptionRef.get(State);
				const Value = Map.get(Section);
				if (Value === undefined) {
					return yield* Effect.fail({
						_tag: "UserSettingsReadFailed" as const,
						section: Section,
						error: new Error(
							`Stub has no value for section "${Section}"`,
						),
					});
				}
				return Value as never;
			}),
		ReadOptional: (Section) =>
			Effect.gen(function* () {
				const Map = yield* SubscriptionRef.get(State);
				return Map.get(Section) as never;
			}),
		Write: (Section, Value, Target: UserSettingsTarget) =>
			Effect.gen(function* () {
				yield* SubscriptionRef.update(State, (Prev) => {
					const Next = new Map(Prev);
					Next.set(Section, Value);
					return Next;
				});
				ChangesQueue.add({
					affectedKeys: new Set([Section]),
					source: Target,
				});
			}),
		HasUserValue: (Section) =>
			Effect.gen(function* () {
				const Map = yield* SubscriptionRef.get(State);
				return Map.has(Section);
			}),
		Changes: Stream.async<UserSettingsChangeEvent, never>((Emit) => {
			for (const Event of ChangesQueue) Emit.single(Event);
			ChangesQueue.clear();
			return Effect.void;
		}),
	};

	return Service;
});
