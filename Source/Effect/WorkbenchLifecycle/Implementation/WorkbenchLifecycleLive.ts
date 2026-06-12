/**
 * Live `Layer<WorkbenchLifecycleService>`. Bridges VS Code's
 * `ILifecycleService` exposed on `globalThis.__CEL_SERVICES__.
 * Lifecycle`.
 *
 * `Advance` sends a Tauri-IPC `lifecycle:advancePhase` to Mountain
 * (mirroring the imperative call already injected by
 * `InjectEagerLifecyclePhase` and `ExposeWorkbenchAccessor`).
 * Phase reads + waits go through the workbench bridge.
 */

import { Effect, Layer, Stream } from "effect";

import type {
	WorkbenchLifecyclePhaseChange,
	WorkbenchLifecycleService,
} from "../Interface/WorkbenchLifecycleService.js";
import { WorkbenchLifecycleServiceTag } from "../Tag/WorkbenchLifecycleServiceTag.js";
import type {
	WorkbenchLifecyclePhase,
	WorkbenchLifecycleProblem,
} from "../Type/WorkbenchLifecycleProblem.js";
import {
	WorkbenchLifecyclePhaseCode,
	WorkbenchLifecyclePhaseFromCode,
	type WorkbenchLifecycleBridgeShape,
	type WorkbenchLifecycleGlobals,
} from "./WorkbenchLifecycleBridgeShape.js";

const Unavailable: WorkbenchLifecycleProblem = {
	_tag: "WorkbenchLifecycleBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Lifecycle is null - the workbench has not yet exposed its ILifecycleService handle.",
};

interface TauriBridge {
	readonly invoke: (
		command: string,

		args?: Record<string, unknown>,
	) => Promise<unknown>;
}

interface TauriGlobal {
	readonly __TAURI__?: {
		readonly invoke?: TauriBridge["invoke"];

		readonly core?: { readonly invoke?: TauriBridge["invoke"] };
	};

	readonly __TAURI_INTERNALS__?: { readonly invoke?: TauriBridge["invoke"] };
}

const ResolveTauriInvoke = (): TauriBridge["invoke"] | null => {
	const G = globalThis as unknown as TauriGlobal;

	return (
		G.__TAURI_INTERNALS__?.invoke ??
		G.__TAURI__?.core?.invoke ??
		G.__TAURI__?.invoke ??
		null
	);
};

function makeWorkbenchLifecycleService(): WorkbenchLifecycleService {
	const getBridge = (): WorkbenchLifecycleBridgeShape | null =>
		(globalThis as unknown as WorkbenchLifecycleGlobals).__CEL_SERVICES__
			?.Lifecycle ?? null;

	const Current = Effect.gen(function* () {
		const Bridge = getBridge();

		if (!Bridge) return yield* Effect.fail(Unavailable);

		return WorkbenchLifecyclePhaseFromCode(Bridge.phase);
	});

	const Advance = (
		Phase: WorkbenchLifecyclePhase,
	): Effect.Effect<void, WorkbenchLifecycleProblem> =>
		Effect.gen(function* () {
			const Invoke = ResolveTauriInvoke();

			if (!Invoke) return yield* Effect.fail(Unavailable);

			yield* Effect.tryPromise({
				try: () =>
					Invoke("MountainIPCInvoke", {
						method: "lifecycle:advancePhase",
						params: [WorkbenchLifecyclePhaseCode(Phase)],
					}),
				catch: () => {
					const B = getBridge();

					return {
						_tag: "WorkbenchLifecyclePhaseRefused",
						attempted: Phase,
						current: B
							? WorkbenchLifecyclePhaseFromCode(B.phase)
							: ("Starting" as const),
					} satisfies WorkbenchLifecycleProblem;
				},
			});
		});

	const When = (
		Phase: WorkbenchLifecyclePhase,
	): Effect.Effect<void, WorkbenchLifecycleProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			yield* Effect.promise(() =>
				Bridge.when(WorkbenchLifecyclePhaseCode(Phase)),
			);
		});

	const Phases = Stream.async<
		WorkbenchLifecyclePhaseChange,
		WorkbenchLifecycleProblem
	>(() => Effect.void);

	const OnWillShutdown = Stream.async<void, WorkbenchLifecycleProblem>(
		(Emit) => {
			const Bridge = getBridge();

			if (!Bridge) {
				Emit.fail(Unavailable);

				return Effect.void;
			}

			const Subscription = Bridge.onWillShutdown(() =>
				Emit.single(undefined),
			);

			return Effect.sync(() => Subscription.dispose());
		},
	);

	const OnDidShutdown = Stream.async<void, WorkbenchLifecycleProblem>(
		(Emit) => {
			const Bridge = getBridge();

			if (!Bridge) {
				Emit.fail(Unavailable);

				return Effect.void;
			}

			const Subscription = Bridge.onDidShutdown(() =>
				Emit.single(undefined),
			);

			return Effect.sync(() => Subscription.dispose());
		},
	);

	const Service: WorkbenchLifecycleService = {
		Current,

		Advance,

		When,

		Phases,

		OnWillShutdown,

		OnDidShutdown,
	};

	return Service;
}

export const WorkbenchLifecycleLive = Layer.succeed(
	WorkbenchLifecycleServiceTag,

	makeWorkbenchLifecycleService(),
);

export default WorkbenchLifecycleLive;
