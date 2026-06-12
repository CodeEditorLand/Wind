import type {
	WorkbenchLayoutChange,
	WorkbenchLayoutPart,
	WorkbenchLayoutService,
	WorkbenchLayoutSnapshot,
} from "../Interface/WorkbenchLayoutService.js";

import { WorkbenchLayoutError } from "../Type/WorkbenchLayoutProblem.js";

import {
	WorkbenchLayoutAllParts,
	type WorkbenchLayoutBridgeShape,
	type WorkbenchLayoutGlobals,
	WorkbenchLayoutPartId,
} from "./WorkbenchLayoutBridgeShape.js";

const Unavailable = (): WorkbenchLayoutError =>
	new WorkbenchLayoutError({
		_tag: "WorkbenchLayoutBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Layout is null.",
	});

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

	const Snapshot = (): WorkbenchLayoutSnapshot => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		const Visible = new Map<WorkbenchLayoutPart, boolean>();

		for (const Part of WorkbenchLayoutAllParts) {
			Visible.set(Part, SnapshotPart(Part));
		}

		return {
			visible: Visible,

			maximized: new Map<WorkbenchLayoutPart, boolean>(),
		};
	};

	const SetVisible = (Part: WorkbenchLayoutPart, Visible: boolean): void => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			Bridge.setPartHidden(
				!Visible,

				WorkbenchLayoutPartId(Part),
			);
		} catch (Cause) {
			throw new WorkbenchLayoutError({
				_tag: "WorkbenchLayoutToggleFailed",
				part: Part,
				error: ToError(Cause),
			});
		}
	};

	const Toggle = (Part: WorkbenchLayoutPart): void => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		const Current = SnapshotPart(Part);

		SetVisible(Part, !Current);
	};

	const Changes = (
		Callback: (change: WorkbenchLayoutChange) => void,
	): { readonly dispose: () => void } => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return Bridge.onDidChangePartVisibility(() => {
			for (const Part of WorkbenchLayoutAllParts) {
				Callback({
					part: Part,
					visible: SnapshotPart(Part),
				});
			}
		});
	};

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
