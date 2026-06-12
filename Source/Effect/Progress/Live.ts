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

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";

import { TauriIPCLive } from "../IPC/index.js";

import type { ProgressService } from "./Interface/ProgressService.js";

import { ProgressServiceTag } from "./Tag/ProgressServiceTag.js";

import type { ProgressProblem } from "./Type/ProgressProblem.js";

const MakeProgressProblem = (error: unknown): ProgressProblem =>
	error instanceof Error
		? { _tag: "ProgressOperationFailed", error }

		: { _tag: "ProgressOperationFailed", error: new Error(String(error)) };

function makeProgressService(): ProgressService {

	const IPCService = TauriIPCLive;

	const Service: ProgressService = {
		Begin: (options) =>
			IPCService.invoke(Channel.ProgressBegin)([
				options.location,

				options.title ?? "",

				options.cancellable ?? false,
			]).pipe(
				Effect.map((Result) =>
					typeof Result === "string"
						? Result
						: `progress-${Date.now()}`,
				),

				Effect.mapError(MakeProgressProblem),
			),

		Report: (id, report) =>
			IPCService.invoke(Channel.ProgressReport)([
				id,

				report.increment ?? 0,

				report.message ?? "",
			]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeProgressProblem),
			),

		End: (id) =>
			IPCService.invoke(Channel.ProgressEnd)([id]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeProgressProblem),
			),
	};

	return Service;
}

export const LiveProgressServiceLayer = Layer.succeed(
	ProgressServiceTag,

	makeProgressService(),
);

export default LiveProgressServiceLayer;
