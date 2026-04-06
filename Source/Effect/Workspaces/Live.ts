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

import { Effect, Layer } from "effect";

import { IPC } from "../IPC.js";
import type { WorkspacesService } from "./Interface/WorkspacesService.js";
import { WorkspacesServiceTag } from "./Tag/WorkspacesServiceTag.js";
import type { WorkspacesProblem } from "./Type/WorkspacesProblem.js";

const MakeWorkspacesProblem = (error: unknown): WorkspacesProblem =>
	error instanceof Error
		? { _tag: "WorkspacesOperationFailed", error }
		: {
				_tag: "WorkspacesOperationFailed",
				error: new Error(String(error)),
			};

export const LiveWorkspacesServiceLayer = Layer.effect(
	WorkspacesServiceTag,
	Effect.gen(function* () {
		const IPCService = yield* IPC;

		const Service: WorkspacesService = {
			GetFolders: () =>
				IPCService.invoke("workspaces:getFolders")([]).pipe(
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
				IPCService.invoke("workspaces:addFolder")([
					uri,
					name ?? "",
				]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeWorkspacesProblem),
				),

			RemoveFolder: (uri) =>
				IPCService.invoke("workspaces:removeFolder")([uri]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeWorkspacesProblem),
				),

			GetName: () =>
				IPCService.invoke("workspaces:getName")([]).pipe(
					Effect.map((Result) =>
						typeof Result === "string" ? Result : undefined,
					),
					Effect.mapError(MakeWorkspacesProblem),
				),
		};

		return Service;
	}),
);

export default LiveWorkspacesServiceLayer;
