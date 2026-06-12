/**
 * @module Effect/Decorations/Live
 * @description
 * Live implementation of DecorationsService backed by Mountain's decoration
 * store via Tauri IPC. File badges (git dirty, errors) shown in the explorer
 * tree are driven by this service.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   decorations:get       → get decoration for one URI
 *   decorations:getMany   → get decorations for multiple URIs
 *   decorations:set       → register / override decoration for a URI
 *   decorations:clear     → remove decoration for a URI
 */

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type {
	DecorationsService,
	FileDecoration,
} from "./Interface/DecorationsService.js";
import type { DecorationsProblem } from "./Type/DecorationsProblem.js";

const MakeDecorationsProblem = (error: unknown): DecorationsProblem => ({
	_tag: "DecorationsOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

function makeDecorationsService(): DecorationsService {
	const IPCService = TauriIPCLive;

	const Service: DecorationsService = {
		GetDecoration: async (uri, includeChildren) => {
			try {
				const Result = await IPCService.invoke(Channel.DecorationsGet, [
					uri,
					includeChildren,
				]);
				return Result != null ? (Result as FileDecoration) : null;
			} catch (error) {
				throw MakeDecorationsProblem(error);
			}
		},

		GetDecorations: async (uris) => {
			try {
				const Result = await IPCService.invoke(Channel.DecorationsGetMany, [uris]);
				const Map_ = new Map<string, FileDecoration>();

				if (Result != null && typeof Result === "object") {
					for (const [Key, Value] of Object.entries(
						Result as Record<string, FileDecoration>,
					)) {
						Map_.set(Key, Value);
					}
				}

				return Map_ as ReadonlyMap<string, FileDecoration>;
			} catch (error) {
				throw MakeDecorationsProblem(error);
			}
		},

		SetDecoration: async (uri, decoration) => {
			try {
				await IPCService.invoke(Channel.DecorationsSet, [uri, decoration]);
			} catch (error) {
				throw MakeDecorationsProblem(error);
			}
		},

		ClearDecoration: async (uri) => {
			try {
				await IPCService.invoke(Channel.DecorationsClear, [uri]);
			} catch (error) {
				throw MakeDecorationsProblem(error);
			}
		},
	};

	return Service;
}

export const LiveDecorationsService = makeDecorationsService();

export default LiveDecorationsService;
