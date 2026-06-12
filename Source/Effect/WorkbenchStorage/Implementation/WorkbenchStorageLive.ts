/**
 * @module Effect/WorkbenchStorage/Implementation/WorkbenchStorageLive
 * @description
 * Live `Layer<WorkbenchStorageService>` that bridges to the
 * workbench's `IStorageService` exposed on
 * `globalThis.__CEL_SERVICES__.Storage`, with read-time
 * short-circuit through `globalThis.__CEL_OVERRIDE_STORAGE__`
 * (the bag the native `InjectStorageOverlay` shim consults).
 *
 * The native shim already redirects upstream `get*` methods to the
 * override bag when the composite key `<scope>:<key>` is present;
 * this Live layer just calls `get(key, scope)` and trusts the
 * cascade. Writes go through `store` directly. `Memory` writes
 * skip the workbench entirely and update the bag.
 * @category Implementation
 */

import { Effect, Layer, Stream } from "effect";

import type {
	WorkbenchStorageChangeEvent,
	WorkbenchStorageScope,
	WorkbenchStorageService,
	WorkbenchStorageTarget,
} from "../Interface/WorkbenchStorageService.js";
import { WorkbenchStorageServiceTag } from "../Tag/WorkbenchStorageServiceTag.js";
import type { WorkbenchStorageProblem } from "../Type/WorkbenchStorageProblem.js";
import type {
	WorkbenchStorageBridgeShape,
	WorkbenchStorageGlobals,
} from "./WorkbenchStorageBridgeShape.js";
import {
	WorkbenchStorageScopeCode,
	WorkbenchStorageScopeFromCode,
	WorkbenchStorageTargetCode,
} from "./WorkbenchStorageScopeCode.js";

const BridgeUnavailable = (Reason: string): WorkbenchStorageProblem => ({
	_tag: "WorkbenchStorageBridgeUnavailable",
	reason: Reason,
});

const ToError = (Cause: unknown): Error =>
	Cause instanceof Error ? Cause : new Error(String(Cause));

function makeWorkbenchStorageService(): WorkbenchStorageService {
	const getBridge = (): WorkbenchStorageBridgeShape | null =>
		(globalThis as unknown as WorkbenchStorageGlobals).__CEL_SERVICES__
			?.Storage ?? null;

	const Unavailable = BridgeUnavailable(
		"globalThis.__CEL_SERVICES__.Storage is null - the workbench has not yet exposed its IStorageService handle. Boot the workbench first or use WorkbenchStorageStub for tests.",
	);

	const Get = (
		Key: string,

		Scope: WorkbenchStorageScope,
	): Effect.Effect<string | undefined, WorkbenchStorageProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			try {
				return Bridge.get(Key, WorkbenchStorageScopeCode(Scope));
			} catch (Cause) {
				return yield* Effect.fail<WorkbenchStorageProblem>({
					_tag: "WorkbenchStorageReadFailed",
					key: Key,
					scope: WorkbenchStorageScopeCode(Scope),
					error: ToError(Cause),
				});
			}
		});

	const GetBoolean = (
		Key: string,

		Scope: WorkbenchStorageScope,
	): Effect.Effect<boolean | undefined, WorkbenchStorageProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			try {
				return Bridge.getBoolean(
					Key,

					WorkbenchStorageScopeCode(Scope),
				);
			} catch (Cause) {
				return yield* Effect.fail<WorkbenchStorageProblem>({
					_tag: "WorkbenchStorageReadFailed",
					key: Key,
					scope: WorkbenchStorageScopeCode(Scope),
					error: ToError(Cause),
				});
			}
		});

	const GetNumber = (
		Key: string,

		Scope: WorkbenchStorageScope,
	): Effect.Effect<number | undefined, WorkbenchStorageProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			try {
				return Bridge.getNumber(
					Key,

					WorkbenchStorageScopeCode(Scope),
				);
			} catch (Cause) {
				return yield* Effect.fail<WorkbenchStorageProblem>({
					_tag: "WorkbenchStorageReadFailed",
					key: Key,
					scope: WorkbenchStorageScopeCode(Scope),
					error: ToError(Cause),
				});
			}
		});

	const GetObject = <T = unknown>(
		Key: string,

		Scope: WorkbenchStorageScope,
	): Effect.Effect<T | undefined, WorkbenchStorageProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			try {
				return Bridge.getObject<T>(
					Key,

					WorkbenchStorageScopeCode(Scope),
				);
			} catch (Cause) {
				return yield* Effect.fail<WorkbenchStorageProblem>({
					_tag: "WorkbenchStorageReadFailed",
					key: Key,
					scope: WorkbenchStorageScopeCode(Scope),
					error: ToError(Cause),
				});
			}
		});

	const Store = (
		Key: string,

		Value: string | number | boolean | object,

		Scope: WorkbenchStorageScope,

		Target: WorkbenchStorageTarget,
	): Effect.Effect<void, WorkbenchStorageProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			try {
				Bridge.store(
					Key,

					Value,

					WorkbenchStorageScopeCode(Scope),

					WorkbenchStorageTargetCode(Target),
				);
			} catch (Cause) {
				return yield* Effect.fail<WorkbenchStorageProblem>({
					_tag: "WorkbenchStorageWriteFailed",
					key: Key,
					scope: WorkbenchStorageScopeCode(Scope),
					error: ToError(Cause),
				});
			}
		});

	const Remove = (
		Key: string,

		Scope: WorkbenchStorageScope,
	): Effect.Effect<void, WorkbenchStorageProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			try {
				Bridge.remove(Key, WorkbenchStorageScopeCode(Scope));
			} catch (Cause) {
				return yield* Effect.fail<WorkbenchStorageProblem>({
					_tag: "WorkbenchStorageRemoveFailed",
					key: Key,
					scope: WorkbenchStorageScopeCode(Scope),
					error: ToError(Cause),
				});
			}
		});

	const Keys = (
		Scope: WorkbenchStorageScope,

		Target: WorkbenchStorageTarget,
	): Effect.Effect<readonly string[], WorkbenchStorageProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			return Bridge.keys(
				WorkbenchStorageScopeCode(Scope),

				WorkbenchStorageTargetCode(Target),
			);
		});

	const Changes = Stream.async<
		WorkbenchStorageChangeEvent,
		WorkbenchStorageProblem
	>((Emit) => {
		const Bridge = getBridge();

		if (!Bridge) {
			Emit.fail(Unavailable);

			return Effect.void;
		}

		const Subscription = Bridge.onDidChangeValue(
			-1,

			undefined,

			undefined,

			(VSEvent) => {
				Emit.single({
					key: VSEvent.key,
					scope: WorkbenchStorageScopeFromCode(VSEvent.scope),
				});
			},
		);

		return Effect.sync(() => Subscription.dispose());
	});

	const Service: WorkbenchStorageService = {
		Get,

		GetBoolean,

		GetNumber,

		GetObject,

		Store,

		Remove,

		Keys,

		Changes,
	};

	return Service;
}

export const WorkbenchStorageLive = Layer.succeed(
	WorkbenchStorageServiceTag,

	makeWorkbenchStorageService(),
);

export default WorkbenchStorageLive;
