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

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type {
	LifecyclePhaseValue,
	LifecycleService,
} from "./Interface/LifecycleService.js";
import type { LifecycleProblem } from "./Type/LifecycleProblem.js";

const MakeLifecycleProblem = (error: unknown): LifecycleProblem => ({
	_tag: "LifecycleOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

function makeLifecycleService(): LifecycleService {
	const IPCService = TauriIPCLive;

	const Service: LifecycleService = {
		GetPhase: async () => {
			try {
				const Result = await IPCService.invoke(Channel.LifecycleGetPhase, []);
				return (typeof Result === "number"
					? Result
					: 1) as LifecyclePhaseValue;
			} catch (error) {
				throw MakeLifecycleProblem(error);
			}
		},

		WhenPhase: async (phase) => {
			try {
				await IPCService.invoke(Channel.LifecycleWhenPhase, [phase]);
			} catch (error) {
				throw MakeLifecycleProblem(error);
			}
		},

		RequestShutdown: async () => {
			try {
				await IPCService.invoke(Channel.LifecycleRequestShutdown, []);
			} catch (error) {
				throw MakeLifecycleProblem(error);
			}
		},

		AdvancePhase: async (phase) => {
			try {
				await IPCService.invoke(Channel.LifecycleAdvancePhase, [phase]);
			} catch (error) {
				throw MakeLifecycleProblem(error);
			}
		},
	};

	return Service;
}

export const LiveLifecycleService = makeLifecycleService();

export default LiveLifecycleService;
