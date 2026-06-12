import type {
	WorkbenchWorkspaceFolder,
	WorkbenchWorkspaceFolderEvent,
	WorkbenchWorkspaceService,
	WorkbenchWorkspaceSnapshot,
} from "../Interface/WorkbenchWorkspaceService.js";

import { WorkbenchWorkspaceError } from "../Type/WorkbenchWorkspaceProblem.js";

import type {
	UpstreamWorkspace,
	UpstreamWorkspaceFolder,
	WorkbenchWorkspaceBridgeShape,
	WorkbenchWorkspaceGlobals,
} from "./WorkbenchWorkspaceBridgeShape.js";

const Unavailable = (): WorkbenchWorkspaceError =>
	new WorkbenchWorkspaceError({
		_tag: "WorkbenchWorkspaceBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Workspace is null.",
	});

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

const ToFolder = (
	folder: UpstreamWorkspaceFolder,
): WorkbenchWorkspaceFolder => ({
	uri: folder.uri.toString(),
	name: folder.name,
	index: folder.index,
});

const ToSnapshot = (
	workspace: UpstreamWorkspace,
): WorkbenchWorkspaceSnapshot => ({
	id: workspace.id,
	folders: workspace.folders.map(ToFolder),
	transient: workspace.transient ?? false,
	configuration: workspace.configuration
		? workspace.configuration.toString()
		: null,
});

function makeWorkbenchWorkspaceService(): WorkbenchWorkspaceService {
	const getBridge = (): WorkbenchWorkspaceBridgeShape | null =>
		(globalThis as unknown as WorkbenchWorkspaceGlobals).__CEL_SERVICES__
			?.Workspace ?? null;

	const Snapshot = (): WorkbenchWorkspaceSnapshot => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			return ToSnapshot(Bridge.getWorkspace());
		} catch (Cause) {
			throw new WorkbenchWorkspaceError({
				_tag: "WorkbenchWorkspaceQueryFailed",
				error: ToError(Cause),
			});
		}
	};

	const Folders = (): ReadonlyArray<WorkbenchWorkspaceFolder> =>
		Snapshot().folders;

	const FolderForResource = (
		Uri: string,
	): WorkbenchWorkspaceFolder | null => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		let Found: UpstreamWorkspaceFolder | null | undefined;

		try {
			Found = Bridge.getWorkspaceFolder({ toString: () => Uri });
		} catch (Cause) {
			throw new WorkbenchWorkspaceError({
				_tag: "WorkbenchWorkspaceQueryFailed",
				error: ToError(Cause),
			});
		}

		return Found ? ToFolder(Found) : null;
	};

	const OnFolderChange = (
		Callback: (event: WorkbenchWorkspaceFolderEvent) => void,
	): { readonly dispose: () => void } => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return Bridge.onDidChangeWorkspaceFolders((Event) => {
			Callback({
				added: Event.added.map(ToFolder),
				removed: Event.removed.map(ToFolder),
				changed: Event.changed.map(ToFolder),
			});
		});
	};

	const Service: WorkbenchWorkspaceService = {
		Snapshot,

		Folders,

		FolderForResource,

		OnFolderChange,
	};

	return Service;
}

export const WorkbenchWorkspaceLive = makeWorkbenchWorkspaceService();

export default WorkbenchWorkspaceLive;
