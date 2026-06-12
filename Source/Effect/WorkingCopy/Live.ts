/**
 * @module Effect/WorkingCopy/Live
 * @description
 * Live implementation of WorkingCopyService backed by Mountain's working-copy
 * state store via Tauri IPC. Drives the dirty dot in editor tabs and the
 * modified-file count badge in the explorer.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   workingCopy:isDirty      → check if URI has unsaved changes
 *   workingCopy:setDirty     → mark URI as dirty/clean
 *   workingCopy:getAllDirty   → list all dirty URIs
 *   workingCopy:getDirtyCount → count of dirty resources
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { WorkingCopyService } from "./Interface/WorkingCopyService.js";
import { WorkingCopyServiceTag } from "./Tag/WorkingCopyServiceTag.js";
import type { WorkingCopyProblem } from "./Type/WorkingCopyProblem.js";

const MakeWorkingCopyProblem = (error: unknown): WorkingCopyProblem => ({
	_tag: "WorkingCopyOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

function makeWorkingCopyService(): WorkingCopyService {
	const IPCService = TauriIPCLive;

	const Service: WorkingCopyService = {
		IsDirty: (uri) =>
			IPCService.invoke(Channel.WorkingCopyIsDirty)([uri]).pipe(
				Effect.map((Result) => Result === true),

				Effect.mapError(MakeWorkingCopyProblem),
			),

		SetDirty: (uri, dirty) =>
			IPCService.invoke(Channel.WorkingCopySetDirty)([uri, dirty]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeWorkingCopyProblem),
			),

		GetAllDirty: () =>
			IPCService.invoke(Channel.WorkingCopyGetAllDirty)([]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result) ? (Result as readonly string[]) : [],
				),

				Effect.mapError(MakeWorkingCopyProblem),
			),

		GetDirtyCount: () =>
			IPCService.invoke(Channel.WorkingCopyGetDirtyCount)([]).pipe(
				Effect.map((Result) =>
					typeof Result === "number" ? Result : 0,
				),

				Effect.mapError(MakeWorkingCopyProblem),
			),
	};

	return Service;
}

export const LiveWorkingCopyServiceLayer = Layer.succeed(
	WorkingCopyServiceTag,

	makeWorkingCopyService(),
);

export default LiveWorkingCopyServiceLayer;
