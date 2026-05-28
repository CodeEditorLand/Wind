import { Effect, Layer, Stream } from "effect";

import type {
	WorkbenchWorkspaceFolder,
	WorkbenchWorkspaceFolderEvent,
	WorkbenchWorkspaceService,
	WorkbenchWorkspaceSnapshot,
} from "../Interface/WorkbenchWorkspaceService.js";
import { WorkbenchWorkspaceServiceTag } from "../Tag/WorkbenchWorkspaceServiceTag.js";
import type { WorkbenchWorkspaceProblem } from "../Type/WorkbenchWorkspaceProblem.js";
import type {
	UpstreamWorkspace,
	UpstreamWorkspaceFolder,
	WorkbenchWorkspaceBridgeShape,
	WorkbenchWorkspaceGlobals,
} from "./WorkbenchWorkspaceBridgeShape.js";

const ResolveBridge = Effect.sync((): WorkbenchWorkspaceBridgeShape | null => {
	const Globals = globalThis as unknown as WorkbenchWorkspaceGlobals;

	return Globals.__CEL_SERVICES__?.Workspace ?? null;
});

const Unavailable: WorkbenchWorkspaceProblem = {
	_tag: "WorkbenchWorkspaceBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.Workspace is null.",
};

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

export const WorkbenchWorkspaceLive = Layer.effect(
	WorkbenchWorkspaceServiceTag,

	Effect.gen(function* () {
		const Bridge = yield* ResolveBridge;

		const Snapshot: Effect.Effect<
			WorkbenchWorkspaceSnapshot,
			WorkbenchWorkspaceProblem
		> = Effect.gen(function* () {
			if (!Bridge) return yield* Effect.fail(Unavailable);

			return yield* Effect.try({
				try: () => ToSnapshot(Bridge.getWorkspace()),
				catch: (Cause) =>
					({
						_tag: "WorkbenchWorkspaceQueryFailed",
						error: ToError(Cause),
					}) satisfies WorkbenchWorkspaceProblem,
			});
		});

		const Folders: Effect.Effect<
			ReadonlyArray<WorkbenchWorkspaceFolder>,
			WorkbenchWorkspaceProblem
		> = Snapshot.pipe(Effect.map((Snap) => Snap.folders));

		const FolderForResource = (
			Uri: string,
		): Effect.Effect<
			WorkbenchWorkspaceFolder | null,
			WorkbenchWorkspaceProblem
		> =>
			Effect.gen(function* () {
				if (!Bridge) return yield* Effect.fail(Unavailable);

				const Found = yield* Effect.try({
					try: () =>
						Bridge.getWorkspaceFolder({ toString: () => Uri }),
					catch: (Cause) =>
						({
							_tag: "WorkbenchWorkspaceQueryFailed",
							error: ToError(Cause),
						}) satisfies WorkbenchWorkspaceProblem,
				});

				return Found ? ToFolder(Found) : null;
			});

		const OnFolderChange = Stream.async<
			WorkbenchWorkspaceFolderEvent,
			WorkbenchWorkspaceProblem
		>((Emit) => {
			if (!Bridge) {
				Emit.fail(Unavailable);

				return Effect.void;
			}

			const Subscription = Bridge.onDidChangeWorkspaceFolders((Event) => {
				Emit.single({
					added: Event.added.map(ToFolder),
					removed: Event.removed.map(ToFolder),
					changed: Event.changed.map(ToFolder),
				});
			});

			return Effect.sync(() => Subscription.dispose());
		});

		const Service: WorkbenchWorkspaceService = {
			Snapshot,
			Folders,
			FolderForResource,
			OnFolderChange,
		};

		return Service;
	}),
);

export default WorkbenchWorkspaceLive;
