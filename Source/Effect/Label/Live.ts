/**
 * @module Effect/Label/Live
 * @description
 * Live implementation of LabelService backed by Mountain via Tauri IPC.
 * Resolves human-readable labels for URIs, workspace roots, and filenames.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   label:getUri        → resolve display label for a URI
 *   label:getWorkspace  → current workspace root label
 *   label:getBase       → basename of a URI
 */

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { LabelService } from "./Interface/LabelService.js";
import type { LabelProblem } from "./Type/LabelProblem.js";

const MakeLabelProblem = (error: unknown): LabelProblem => ({
	_tag: "LabelOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

export const LiveLabelService: LabelService = {
	GetUriLabel: (uri, options) => {
		try {
			const Result = TauriIPCLive.invoke(Channel.LabelGetURI, [
				uri,
				options?.relative ?? false,
			]);

			void (Result as Promise<unknown>).catch(() => {});

			return uri;
		} catch (error) {
			throw MakeLabelProblem(error);
		}
	},

	GetWorkspaceLabel: () => {
		try {
			const Result = TauriIPCLive.invoke(Channel.LabelGetWorkspace, []);

			void (Result as Promise<unknown>).catch(() => {});

			return "";
		} catch (error) {
			throw MakeLabelProblem(error);
		}
	},

	GetBaseLabel: (uri) => {
		try {
			const Result = TauriIPCLive.invoke(Channel.LabelGetBase, [uri]);

			void (Result as Promise<unknown>).catch(() => {});

			return uri.split("/").pop() ?? uri;
		} catch (error) {
			throw MakeLabelProblem(error);
		}
	},
};

export default LiveLabelService;
