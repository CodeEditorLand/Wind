/**
 * @module Effect/Lifecycle/Live
 * @description
 * Live implementation of LifecycleService backed by Mountain's application
 * phase state via Tauri IPC. Components use this to defer expensive work until
 * the editor is fully initialised (Restored/Eventually phase).
 *
 * IPC channels (WindServiceHandlers.rs):
 *   lifecycle:getPhase       → get current phase (1-4)
 *   lifecycle:whenPhase      → poll until phase is reached
 *   lifecycle:requestShutdown → initiate graceful app shutdown
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type {
	LifecyclePhaseValue,
	LifecycleService,
} from "./Interface/LifecycleService.js";
import { LifecycleServiceTag } from "./Tag/LifecycleServiceTag.js";
import type { LifecycleProblem } from "./Type/LifecycleProblem.js";

const MakeLifecycleProblem = (error: unknown): LifecycleProblem => ({
	_tag: "LifecycleOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

function makeLifecycleService(): LifecycleService {
	const IPCService = TauriIPCLive;

	const Service: LifecycleService = {
		GetPhase: () =>
			IPCService.invoke(Channel.LifecycleGetPhase)([]).pipe(
				Effect.map(
					(Result) =>
						(typeof Result === "number"
							? Result
							: 1) as LifecyclePhaseValue,
				),

				Effect.mapError(MakeLifecycleProblem),
			),

		WhenPhase: (phase) =>
			IPCService.invoke(Channel.LifecycleWhenPhase)([phase]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeLifecycleProblem),
			),

		RequestShutdown: () =>
			IPCService.invoke(Channel.LifecycleRequestShutdown)([]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeLifecycleProblem),
			),

		AdvancePhase: (phase) =>
			IPCService.invoke(Channel.LifecycleAdvancePhase)([phase]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeLifecycleProblem),
			),
	};

	return Service;
}

export const LiveLifecycleServiceLayer = Layer.succeed(
	LifecycleServiceTag,

	makeLifecycleService(),
);

export default LiveLifecycleServiceLayer;
