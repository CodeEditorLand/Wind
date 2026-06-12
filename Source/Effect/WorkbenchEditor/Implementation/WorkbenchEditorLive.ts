import type {
	WorkbenchEditorActiveSnapshot,
	WorkbenchEditorChangeEvent,
	WorkbenchEditorOpenInput,
	WorkbenchEditorService,
} from "../Interface/WorkbenchEditorService.js";
import { WorkbenchEditorError } from "../Type/WorkbenchEditorProblem.js";
import type {
	UpstreamEditorPaneSnapshot,
	WorkbenchEditorBridgeShape,
	WorkbenchEditorGlobals,
} from "./WorkbenchEditorBridgeShape.js";

const Unavailable = (): WorkbenchEditorError =>
	new WorkbenchEditorError({
		_tag: "WorkbenchEditorBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Editor is null.",
	});

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

	const Active = (): WorkbenchEditorActiveSnapshot => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return ToSnapshot(Bridge.activeEditorPane);
	};

	const Open = async (
		Input: WorkbenchEditorOpenInput,
	): Promise<WorkbenchEditorActiveSnapshot> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			const Pane = await Bridge.openEditor(
				{
					resource: { toString: () => Input.resource },
				},

				{
					...(Input.preserveFocus !== undefined
						? { preserveFocus: Input.preserveFocus }
						: {}),
					...(Input.preview !== undefined
						? { preview: Input.preview }
						: {}),
					...(Input.pinned !== undefined
						? { pinned: Input.pinned }
						: {}),
				},

				typeof Input.columnIndex === "number"
					? { id: Input.columnIndex }
					: undefined,
			);

			return ToSnapshot(Pane ?? null);
		} catch (Cause) {
			throw new WorkbenchEditorError({
				_tag: "WorkbenchEditorOpenFailed",
				uri: Input.resource,
				error: ToError(Cause),
			});
		}
	};

	const CloseActive = async (): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		const Pane = Bridge.activeEditorPane;

		if (!Pane) return;

		try {
			await Bridge.closeEditor(Pane);
		} catch (Cause) {
			throw new WorkbenchEditorError({
				_tag: "WorkbenchEditorCloseFailed",
				editorId: Pane.input?.editorId ?? Pane.getId?.() ?? "<active>",
				error: ToError(Cause),
			});
		}
	};

	const OnActiveChange = (
		Callback: (event: WorkbenchEditorChangeEvent) => void,
	): { readonly dispose: () => void } => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return Bridge.onDidActiveEditorChange((Event) => {
			Callback({
				previous: Event.previous ? ToSnapshot(Event.previous) : null,
				current: ToSnapshot(Event.current),
			});
		});
	};

	const Service: WorkbenchEditorService = {
		Active,

		Open,

		CloseActive,

		OnActiveChange,
	};

	return Service;
}

export const WorkbenchEditorLive = makeWorkbenchEditorService();

export default WorkbenchEditorLive;
