/**
 * @module Effect/Workspaces/Live
 * @description
 * Live implementation of WorkspacesService via Tauri IPC. Reads workspace
 * folder state from Mountain's ApplicationState.Workspace and supports
 * adding/removing folders via UpdateWorkspaceFolders.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   workspaces:getFolders  → ApplicationState::Workspace.GetFolders()
 *   workspaces:addFolder   → UpdateWorkspaceFolders(add)
 *   workspaces:removeFolder → UpdateWorkspaceFolders(remove)
 *   workspaces:getName     → ApplicationState::Workspace.GetName()
 */

import { Effect, Layer, Stream } from "effect";

import Channel from "../../IPC/Channel.js";
import SkyEvent from "../../IPC/SkyEvent.js";
import { TauriIPCLive } from "../IPC/index.js";
import type {
	WorkspaceFolder,
	WorkspacesChangeEvent,
	WorkspacesService,
} from "./Interface/WorkspacesService.js";
import { WorkspacesServiceTag } from "./Tag/WorkspacesServiceTag.js";
import type { WorkspacesProblem } from "./Type/WorkspacesProblem.js";

const MakeWorkspacesProblem = (error: unknown): WorkspacesProblem =>
	error instanceof Error
		? { _tag: "WorkspacesOperationFailed", error }
		: {
				_tag: "WorkspacesOperationFailed",

				error: new Error(String(error)),
			};

/**
 * Coerce one array element from Mountain's `sky://workspaces/changed` payload
 * into a `WorkspaceFolder`. Mountain serialises `{ uri, name, index }` in
 * `Mountain/.../WorkspaceDelta.rs::FolderToWire`; we tolerate missing fields
 * because the stream is fire-and-forget and a malformed entry must not crash
 * the subscriber.
 */
const CoerceFolder = (Entry: unknown): WorkspaceFolder | undefined => {
	if (!Entry || typeof Entry !== "object") return undefined;

	const Record = Entry as Record<string, unknown>;

	const Uri = Record["uri"];

	const Name = Record["name"];

	const Index = Record["index"];

	if (typeof Uri !== "string") return undefined;

	return {
		uri: Uri,

		name: typeof Name === "string" ? Name : "",

		index: typeof Index === "number" ? Index : 0,
	};
};

const CoerceFolderArray = (Value: unknown): readonly WorkspaceFolder[] => {
	if (!Array.isArray(Value)) return [];

	const Out: WorkspaceFolder[] = [];

	for (const Entry of Value) {
		const Folder = CoerceFolder(Entry);

		if (Folder) Out.push(Folder);
	}

	return Out;
};

function makeWorkspacesService(): WorkspacesService {
	const IPCService = TauriIPCLive;

	const Service: WorkspacesService = {
		GetFolders: () =>
			IPCService.invoke(Channel.WorkspacesGetFolders)([]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result)
						? (Result as readonly {
								uri: string;

								name: string;

								index: number;
							}[])
						: [],
				),

				Effect.mapError(MakeWorkspacesProblem),
			),

		AddFolder: (uri, name) =>
			IPCService.invoke(Channel.WorkspacesAddFolder)([
				uri,

				name ?? "",
			]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeWorkspacesProblem),
			),

		RemoveFolder: (uri) =>
			IPCService.invoke(Channel.WorkspacesRemoveFolder)([uri]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeWorkspacesProblem),
			),

		GetName: () =>
			IPCService.invoke(Channel.WorkspacesGetName)([]).pipe(
				Effect.map((Result) =>
					typeof Result === "string" ? Result : undefined,
				),

				Effect.mapError(MakeWorkspacesProblem),
			),

		/**
		 * Mountain broadcasts every workspace mutation on
		 * `sky://workspaces/changed` from
		 * `UpdateWorkspaceFoldersAndBroadcast`. Map each event's raw
		 * payload into a typed `WorkspacesChangeEvent` and drop entries
		 * we can't parse - Mountain is the source of truth for folder
		 * shape, but defensive parsing keeps the stream alive if a
		 * future field is introduced.
		 */
		OnChange: () =>
			IPCService.events(SkyEvent.WorkspacesChanged).pipe(
				Stream.map((Event): WorkspacesChangeEvent => {
					const E = Event as { args: unknown[] };

					const Payload = (E.args[0] ?? {}) as Record<
						string,
						unknown
					>;

					return {
						added: CoerceFolderArray(Payload["added"]),
						removed: CoerceFolderArray(Payload["removed"]),
						folders: CoerceFolderArray(Payload["folders"]),
					};
				}),

				Stream.mapError(MakeWorkspacesProblem),
			),
	};

	return Service;
}

export const LiveWorkspacesServiceLayer = Layer.succeed(
	WorkspacesServiceTag,

	makeWorkspacesService(),
);

export default LiveWorkspacesServiceLayer;
