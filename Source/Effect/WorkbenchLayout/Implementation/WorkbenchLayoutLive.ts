import { Effect, Stream } from "effect";

import type {
	WorkbenchLayoutChange,
	WorkbenchLayoutPart,
	WorkbenchLayoutService,
	WorkbenchLayoutSnapshot,
} from "../Interface/WorkbenchLayoutService.js";
import type { WorkbenchLayoutProblem } from "../Type/WorkbenchLayoutProblem.js";
import {
	WorkbenchLayoutAllParts,
	WorkbenchLayoutPartId,
	type WorkbenchLayoutBridgeShape,
	type WorkbenchLayoutGlobals,
} from "./WorkbenchLayoutBridgeShape.js";

const Unavailable: WorkbenchLayoutProblem = {
	_tag: "WorkbenchLayoutBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Layout is null.",
};

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

function makeWorkbenchLayoutService(): WorkbenchLayoutService {
	const getBridge = (): WorkbenchLayoutBridgeShape | null =>
		(globalThis as unknown as WorkbenchLayoutGlobals).__CEL_SERVICES__
			?.Layout ?? null;

	const SnapshotPart = (Part: WorkbenchLayoutPart): boolean => {
		const Bridge = getBridge();

		return Bridge?.isVisible(WorkbenchLayoutPartId(Part)) ?? false;
	};

	const Snapshot: Effect.Effect<
		WorkbenchLayoutSnapshot,
		WorkbenchLayoutProblem
	> = Effect.gen(function* () {
		const Bridge = getBridge();

		if (!Bridge) return yield* Effect.fail(Unavailable);

		const Visible = new Map<WorkbenchLayoutPart, boolean>();

		for (const Part of WorkbenchLayoutAllParts) {
			Visible.set(Part, SnapshotPart(Part));
		}

		return {
			visible: Visible,
			maximized: new Map<WorkbenchLayoutPart, boolean>(),
		};
	});

	const SetVisible = (
		Part: WorkbenchLayoutPart,

		Visible: boolean,
	): Effect.Effect<void, WorkbenchLayoutProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			yield* Effect.try({
				try: () =>
					Bridge.setPartHidden(
						!Visible,

						WorkbenchLayoutPartId(Part),
					),
				catch: (Cause) =>
					({
						_tag: "WorkbenchLayoutToggleFailed",
						part: Part,
						error: ToError(Cause),
					}) satisfies WorkbenchLayoutProblem,
			});
		});

	const Toggle = (
		Part: WorkbenchLayoutPart,
	): Effect.Effect<void, WorkbenchLayoutProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			const Current = SnapshotPart(Part);

			yield* SetVisible(Part, !Current);
		});

	const Changes = Stream.async<WorkbenchLayoutChange, WorkbenchLayoutProblem>(
		(Emit) => {
			const Bridge = getBridge();

			if (!Bridge) {
				Emit.fail(Unavailable);

				return Effect.void;
			}

			const Subscription = Bridge.onDidChangePartVisibility(() => {
				for (const Part of WorkbenchLayoutAllParts) {
					Emit.single({
						part: Part,
						visible: SnapshotPart(Part),
					});
				}
			});

			return Effect.sync(() => Subscription.dispose());
		},
	);

	const Service: WorkbenchLayoutService = {
		Snapshot,

		SetVisible,

		Toggle,

		Changes,
	};

	return Service;
}

export const WorkbenchLayoutLive = makeWorkbenchLayoutService();

export default WorkbenchLayoutLive;
