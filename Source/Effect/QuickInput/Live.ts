/**
 * @module Effect/QuickInput/Live
 * @description
 * Live implementation of QuickInputService via Tauri IPC. Mountain's
 * UserInterfaceProvider handles the blocking oneshot channel pattern -
 * the IPC call blocks until Sky resolves the request via ResolveUIRequest.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   quickInput:showQuickPick  → UserInterfaceProvider::ShowQuickPick
 *   quickInput:showInputBox   → UserInterfaceProvider::ShowInputBox
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { QuickInputService } from "./Interface/QuickInputService.js";
import { QuickInputServiceTag } from "./Tag/QuickInputServiceTag.js";
import type { QuickInputProblem } from "./Type/QuickInputProblem.js";

const MakeQuickInputProblem = (error: unknown): QuickInputProblem =>
	error instanceof Error
		? { _tag: "QuickInputOperationFailed", error }
		: {
				_tag: "QuickInputOperationFailed",

				error: new Error(String(error)),
			};

function makeQuickInputService(): QuickInputService {
	const IPCService = TauriIPCLive;

	const Service: QuickInputService = {
		ShowQuickPick: (items, options) =>
			IPCService.invoke(Channel.QuickInputShowQuickPick)([
				items,

				options ?? {},
			]).pipe(
				Effect.map((Result) => {
					if (Result === null || Result === undefined)
						return undefined;

					return Result as {
						label: string;

						description?: string;

						detail?: string;

						picked?: boolean;
					};
				}),

				Effect.mapError(MakeQuickInputProblem),
			),

		ShowInputBox: (options) =>
			IPCService.invoke(Channel.QuickInputShowInputBox)([
				options ?? {},
			]).pipe(
				Effect.map((Result) =>
					typeof Result === "string" ? Result : undefined,
				),

				Effect.mapError(MakeQuickInputProblem),
			),
	};

	return Service;
}

export const LiveQuickInputServiceLayer = Layer.succeed(
	QuickInputServiceTag,

	makeQuickInputService(),
);

export default LiveQuickInputServiceLayer;
