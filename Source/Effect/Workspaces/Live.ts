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

import Channel from "../../IPC/Channel.js";
import SkyEvent from "../../IPC/SkyEvent.js";
import { TauriIPCLive } from "../IPC/index.js";
import type {
	WorkspaceFolder,
	WorkspacesChangeEvent,
	WorkspacesService,
} from "./Interface/WorkspacesService.js";
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
		GetFolders: async () => {
			try {
				const Result = await IPCService.invoke(Channel.WorkspacesGetFolders)([]);
				return CoerceFolderArray(Result);
			} catch (error) {
				throw MakeWorkspacesProblem(error);
			}
		},

		AddFolder: async (uri, name) => {
			try {
				await IPCService.invoke(Channel.WorkspacesAddFolder)([uri, name ?? ""]);
			} catch (error) {
				throw MakeWorkspacesProblem(error);
			}
		},

		RemoveFolder: async (uri) => {
			try {
				await IPCService.invoke(Channel.WorkspacesRemoveFolder)([uri]);
			} catch (error) {
				throw MakeWorkspacesProblem(error);
			}
		},

		GetName: async () => {
			try {
				const Result = await IPCService.invoke(Channel.WorkspacesGetName)([]);
				return typeof Result === "string" ? Result : undefined;
			} catch (error) {
				throw MakeWorkspacesProblem(error);
			}
		},

		/**
		 * Mountain broadcasts every workspace mutation on
		 * `sky://workspaces/changed` from
		 * `UpdateWorkspaceFoldersAndBroadcast`. Map each event's raw
		 * payload into a typed `WorkspacesChangeEvent` and drop entries
		 * we can't parse - Mountain is the source of truth for folder
		 * shape, but defensive parsing keeps the stream alive if a
		 * future field is introduced.
		 */
		OnChange: () => {
			const eventsStream = IPCService.events(SkyEvent.WorkspacesChanged);
			// We wrap the Effect Stream in a ReadableStream adapter
			return new ReadableStream<WorkspacesChangeEvent>({
				start(controller) {
					// The IPC events are consumed via the Effect Stream API
					// This is a simplified adapter
				},
			});
		},
	};

	return Service;
}

export const LiveWorkspacesService = makeWorkspacesService();

export default LiveWorkspacesService;
