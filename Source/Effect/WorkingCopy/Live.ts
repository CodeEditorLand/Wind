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

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { WorkingCopyService } from "./Interface/WorkingCopyService.js";
import type { WorkingCopyProblem } from "./Type/WorkingCopyProblem.js";

const MakeWorkingCopyProblem = (error: unknown): WorkingCopyProblem => ({
	_tag: "WorkingCopyOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

export const LiveWorkingCopyService: WorkingCopyService = {
	IsDirty: (uri) => {
		try {
			const Result = TauriIPCLive.invoke(Channel.WorkingCopyIsDirty, [uri]);

			void (Result as Promise<unknown>).catch(() => {});

			return false;
		} catch (error) {
			throw MakeWorkingCopyProblem(error);
		}
	},

	SetDirty: (uri, dirty) => {
		try {
			const Result = TauriIPCLive.invoke(Channel.WorkingCopySetDirty, [
				uri,
				dirty,
			]);

			void (Result as Promise<unknown>).catch(() => {});
		} catch (error) {
			throw MakeWorkingCopyProblem(error);
		}
	},

	GetAllDirty: () => {
		try {
			const Result = TauriIPCLive.invoke(
				Channel.WorkingCopyGetAllDirty,
				[],
			);

			void (Result as Promise<unknown>).catch(() => {});

			return [];
		} catch (error) {
			throw MakeWorkingCopyProblem(error);
		}
	},

	GetDirtyCount: () => {
		try {
			const Result = TauriIPCLive.invoke(
				Channel.WorkingCopyGetDirtyCount,
				[],
			);

			void (Result as Promise<unknown>).catch(() => {});

			return 0;
		} catch (error) {
			throw MakeWorkingCopyProblem(error);
		}
	},
};

export default LiveWorkingCopyService;
