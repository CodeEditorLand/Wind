import { Effect, Layer, Stream } from "effect";

import type {
	WorkbenchEditorActiveSnapshot,
	WorkbenchEditorChangeEvent,
	WorkbenchEditorOpenInput,
	WorkbenchEditorService,
} from "../Interface/WorkbenchEditorService.js";
import { WorkbenchEditorServiceTag } from "../Tag/WorkbenchEditorServiceTag.js";
import type { WorkbenchEditorProblem } from "../Type/WorkbenchEditorProblem.js";
import type {
	UpstreamEditorPaneSnapshot,
	WorkbenchEditorBridgeShape,
	WorkbenchEditorGlobals,
} from "./WorkbenchEditorBridgeShape.js";

const Unavailable: WorkbenchEditorProblem = {
	_tag: "WorkbenchEditorBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Editor is null.",
};

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

const ToSnapshot = (
	pane: UpstreamEditorPaneSnapshot | null | undefined,
): WorkbenchEditorActiveSnapshot => {
	if (!pane) {
		return {
			resource: null,

			editorId: null,

			groupId: null,

			languageId: null,
		};
	}

	return {
		resource: pane.input?.resource?.toString() ?? null,

		editorId: pane.input?.editorId ?? pane.getId?.() ?? null,

		groupId: pane.group?.id ?? null,

		languageId: null,
	};
};

function makeWorkbenchEditorService(): WorkbenchEditorService {
	const getBridge = (): WorkbenchEditorBridgeShape | null =>
		(globalThis as unknown as WorkbenchEditorGlobals).__CEL_SERVICES__
			?.Editor ?? null;

	const Active: Effect.Effect<
		WorkbenchEditorActiveSnapshot,
		WorkbenchEditorProblem
	> = Effect.gen(function* () {
		const Bridge = getBridge();

		if (!Bridge) return yield* Effect.fail(Unavailable);

		return ToSnapshot(Bridge.activeEditorPane);
	});

	const Open = (
		Input: WorkbenchEditorOpenInput,
	): Effect.Effect<WorkbenchEditorActiveSnapshot, WorkbenchEditorProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			const Pane = yield* Effect.tryPromise({
				try: () =>
					Bridge.openEditor(
						{
							resource: { toString: () => Input.resource },
						},

						{
							preserveFocus: Input.preserveFocus,
							preview: Input.preview,
							pinned: Input.pinned,
						},

						typeof Input.columnIndex === "number"
							? { id: Input.columnIndex }
							: undefined,
					),
				catch: (Cause) =>
					({
						_tag: "WorkbenchEditorOpenFailed",
						uri: Input.resource,
						error: ToError(Cause),
					}) satisfies WorkbenchEditorProblem,
			});

			return ToSnapshot(Pane ?? null);
		});

	const CloseActive: Effect.Effect<void, WorkbenchEditorProblem> = Effect.gen(
		function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			const Pane = Bridge.activeEditorPane;

			if (!Pane) return;

			yield* Effect.tryPromise({
				try: () => Bridge.closeEditor(Pane),
				catch: (Cause) =>
					({
						_tag: "WorkbenchEditorCloseFailed",
						editorId:
							Pane.input?.editorId ??
							Pane.getId?.() ??
							"<active>",
						error: ToError(Cause),
					}) satisfies WorkbenchEditorProblem,
			});
		},
	);

	const OnActiveChange = Stream.async<
		WorkbenchEditorChangeEvent,
		WorkbenchEditorProblem
	>((Emit) => {
		const Bridge = getBridge();

		if (!Bridge) {
			Emit.fail(Unavailable);

			return Effect.void;
		}

		const Subscription = Bridge.onDidActiveEditorChange((Event) => {
			Emit.single({
				previous: Event.previous ? ToSnapshot(Event.previous) : null,
				current: ToSnapshot(Event.current),
			});
		});

		return Effect.sync(() => Subscription.dispose());
	});

	const Service: WorkbenchEditorService = {
		Active,

		Open,

		CloseActive,

		OnActiveChange,
	};

	return Service;
}

export const WorkbenchEditorLive = Layer.succeed(
	WorkbenchEditorServiceTag,

	makeWorkbenchEditorService(),
);

export default WorkbenchEditorLive;
