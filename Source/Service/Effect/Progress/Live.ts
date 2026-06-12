/**
 * @module Effect/Progress/Live
 * @description
 * Live implementation of ProgressService via Tauri IPC. Mountain emits
 * sky://progress/* events that Sky renders as progress indicators.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   progress:begin   -> sky://progress/begin (Mountain AppHandle.emit)
 *   progress:report  -> sky://progress/report
 *   progress:end     -> sky://progress/end
 */

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { ProgressService } from "./Interface/ProgressService.js";
import type { ProgressProblem } from "./Type/ProgressProblem.js";

const MakeProgressProblem = (error: unknown): ProgressProblem =>
	error instanceof Error
		? { _tag: "ProgressOperationFailed", error }
		: { _tag: "ProgressOperationFailed", error: new Error(String(error)) };

function makeProgressService(): ProgressService {
	const IPCService = TauriIPCLive;

	const Service: ProgressService = {
		Begin: async (options) => {
			try {
				const Result = await IPCService.invoke(Channel.ProgressBegin)([
					options.location,

					options.title ?? "",

					options.cancellable ?? false,
				]);

				return typeof Result === "string"
					? Result
					: `progress-${Date.now()}`;
			} catch (error) {
				throw MakeProgressProblem(error);
			}
		},

		Report: async (id, report) => {
			try {
				await IPCService.invoke(Channel.ProgressReport)([
					id,

					report.increment ?? 0,

					report.message ?? "",
				]);
			} catch (error) {
				throw MakeProgressProblem(error);
			}
		},

		End: async (id) => {
			try {
				await IPCService.invoke(Channel.ProgressEnd)([id]);
			} catch (error) {
				throw MakeProgressProblem(error);
			}
		},
	};

	return Service;
}

export const LiveProgressService = makeProgressService();

export default LiveProgressService;
