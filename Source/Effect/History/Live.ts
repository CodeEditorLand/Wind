/**
 * @module Effect/History/Live
 * @description
 * Live implementation of HistoryService backed by Mountain's navigation
 * history store via Tauri IPC. Drives back/forward navigation in the editor.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   history:goBack      → navigate to previous location
 *   history:goForward   → navigate to next location
 *   history:canGoBack   → whether back navigation is available
 *   history:canGoForward → whether forward navigation is available
 *   history:push        → push a URI onto the stack
 *   history:clear       → clear the navigation stack
 *   history:getStack    → return the full history stack
 */

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { HistoryService } from "./Interface/HistoryService.js";
import type { HistoryProblem } from "./Type/HistoryProblem.js";

const MakeHistoryProblem = (error: unknown): HistoryProblem => ({
	_tag: "HistoryOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

function makeHistoryService(): HistoryService {
	const IPCService = TauriIPCLive;

	const Service: HistoryService = {
		GoBack: async () => {
			try {
				await IPCService.invoke(Channel.HistoryGoBack, []);
			} catch (error) {
				throw MakeHistoryProblem(error);
			}
		},

		GoForward: async () => {
			try {
				await IPCService.invoke(Channel.HistoryGoForward, []);
			} catch (error) {
				throw MakeHistoryProblem(error);
			}
		},

		CanGoBack: async () => {
			try {
				const Result = await IPCService.invoke(Channel.HistoryCanGoBack, []);
				return Result === true;
			} catch (error) {
				throw MakeHistoryProblem(error);
			}
		},

		CanGoForward: async () => {
			try {
				const Result = await IPCService.invoke(Channel.HistoryCanGoForward, []);
				return Result === true;
			} catch (error) {
				throw MakeHistoryProblem(error);
			}
		},

		Push: async (uri) => {
			try {
				await IPCService.invoke(Channel.HistoryPush, [uri]);
			} catch (error) {
				throw MakeHistoryProblem(error);
			}
		},

		Clear: async () => {
			try {
				await IPCService.invoke(Channel.HistoryClear, []);
			} catch (error) {
				throw MakeHistoryProblem(error);
			}
		},

		GetStack: async () => {
			try {
				const Result = await IPCService.invoke(Channel.HistoryGetStack, []);
				return Array.isArray(Result) ? (Result as readonly string[]) : [];
			} catch (error) {
				throw MakeHistoryProblem(error);
			}
		},
	};

	return Service;
}

export const LiveHistoryService = makeHistoryService();

export default LiveHistoryService;
