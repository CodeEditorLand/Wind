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

import { IPC } from "../IPC.js";
import type { HistoryService } from "./Interface/HistoryService.js";
import { HistoryServiceTag } from "./Tag/HistoryServiceTag.js";
import type { HistoryProblem } from "./Type/HistoryProblem.js";

const MakeHistoryProblem = (error: unknown): HistoryProblem => ({
	_tag: "HistoryOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

export const LiveHistoryServiceLayer = Layer.effect(
	HistoryServiceTag,
	Effect.gen(function* () {
		const IPCService = yield* IPC;

		const Service: HistoryService = {
			GoBack: () =>
				IPCService.invoke("history:goBack")([]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeHistoryProblem),
				),

			GoForward: () =>
				IPCService.invoke("history:goForward")([]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeHistoryProblem),
				),

			CanGoBack: () =>
				IPCService.invoke("history:canGoBack")([]).pipe(
					Effect.map((Result) => Result === true),
					Effect.mapError(MakeHistoryProblem),
				),

			CanGoForward: () =>
				IPCService.invoke("history:canGoForward")([]).pipe(
					Effect.map((Result) => Result === true),
					Effect.mapError(MakeHistoryProblem),
				),

			Push: (uri) =>
				IPCService.invoke("history:push")([uri]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeHistoryProblem),
				),

			Clear: () =>
				IPCService.invoke("history:clear")([]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeHistoryProblem),
				),

			GetStack: () =>
				IPCService.invoke("history:getStack")([]).pipe(
					Effect.map((Result) =>
						Array.isArray(Result)
							? (Result as readonly string[])
							: [],
					),
					Effect.mapError(MakeHistoryProblem),
				),
		};

		return Service;
	}),
);

export default LiveHistoryServiceLayer;
