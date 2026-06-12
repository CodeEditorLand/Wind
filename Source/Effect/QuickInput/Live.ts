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

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { QuickInputService } from "./Interface/QuickInputService.js";
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
		ShowQuickPick: async (items, options) => {
			try {
				const Result = await IPCService.invoke(Channel.QuickInputShowQuickPick)([
					items,
					options ?? {},
				]);
				if (Result === null || Result === undefined)
					return undefined;

				return Result as {
					label: string;
					description?: string;
					detail?: string;
					picked?: boolean;
				};
			} catch (error) {
				throw MakeQuickInputProblem(error);
			}
		},

		ShowInputBox: async (options) => {
			try {
				const Result = await IPCService.invoke(Channel.QuickInputShowInputBox)([
					options ?? {},
				]);
				return typeof Result === "string" ? Result : undefined;
			} catch (error) {
				throw MakeQuickInputProblem(error);
			}
		},
	};

	return Service;
}

export const LiveQuickInputService = makeQuickInputService();

export default LiveQuickInputService;
