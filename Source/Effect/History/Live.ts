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

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { HistoryService } from "./Interface/HistoryService.js";
import { HistoryServiceTag } from "./Tag/HistoryServiceTag.js";
import type { HistoryProblem } from "./Type/HistoryProblem.js";

const MakeHistoryProblem = (error: unknown): HistoryProblem => ({
	_tag: "HistoryOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

function makeHistoryService(): HistoryService {
	const IPCService = TauriIPCLive;

	const Service: HistoryService = {
		GoBack: () =>
			IPCService.invoke(Channel.HistoryGoBack)([]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeHistoryProblem),
			),

		GoForward: () =>
			IPCService.invoke(Channel.HistoryGoForward)([]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeHistoryProblem),
			),

		CanGoBack: () =>
			IPCService.invoke(Channel.HistoryCanGoBack)([]).pipe(
				Effect.map((Result) => Result === true),

				Effect.mapError(MakeHistoryProblem),
			),

		CanGoForward: () =>
			IPCService.invoke(Channel.HistoryCanGoForward)([]).pipe(
				Effect.map((Result) => Result === true),

				Effect.mapError(MakeHistoryProblem),
			),

		Push: (uri) =>
			IPCService.invoke(Channel.HistoryPush)([uri]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeHistoryProblem),
			),

		Clear: () =>
			IPCService.invoke(Channel.HistoryClear)([]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeHistoryProblem),
			),

		GetStack: () =>
			IPCService.invoke(Channel.HistoryGetStack)([]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result) ? (Result as readonly string[]) : [],
				),

				Effect.mapError(MakeHistoryProblem),
			),
	};

	return Service;
}

export const LiveHistoryServiceLayer = Layer.succeed(
	HistoryServiceTag,

	makeHistoryService(),
);

export default LiveHistoryServiceLayer;
