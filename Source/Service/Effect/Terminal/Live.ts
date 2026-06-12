/**
 * @module Effect/Terminal/Live
 * @description
 * Live implementation of TerminalService backed by Mountain's TerminalProvider
 * via Tauri IPC. Creates real PTY terminals and forwards I/O.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   terminal:create    → TerminalProvider::CreateTerminal
 *   terminal:sendText  → TerminalProvider::SendTextToTerminal
 *   terminal:dispose   → TerminalProvider::DisposeTerminal
 *   terminal:show      → TerminalProvider::ShowTerminal
 *   terminal:hide      → TerminalProvider::HideTerminal
 */

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { TerminalService } from "./Interface/TerminalService.js";
import type { TerminalProblem } from "./Type/TerminalProblem.js";

const MakeTerminalProblem = (error: unknown): TerminalProblem =>
	error instanceof Error
		? { _tag: "TerminalOperationFailed", error }
		: { _tag: "TerminalOperationFailed", error: new Error(String(error)) };

function makeLiveTerminalService(): TerminalService {
	const IPCService = TauriIPCLive;

	const Service: TerminalService = {
		CreateTerminal: async (options) => {
			try {
				const Result = await IPCService.invoke(Channel.TerminalCreate)([
					options ?? {},
				]);

				const Info = Result as { id?: number; name?: string };

				return {
					id: Info.id ?? 0,

					name: Info.name ?? "terminal",
				};
			} catch (error) {
				throw MakeTerminalProblem(error);
			}
		},

		SendText: async (id, text) => {
			try {
				await IPCService.invoke(Channel.TerminalSendText)([id, text]);
			} catch (error) {
				throw MakeTerminalProblem(error);
			}
		},

		Dispose: async (id) => {
			try {
				await IPCService.invoke(Channel.TerminalDispose)([id]);
			} catch (error) {
				throw MakeTerminalProblem(error);
			}
		},

		Show: async (id, preserveFocus) => {
			try {
				await IPCService.invoke(Channel.TerminalShow)([
					id,

					preserveFocus ?? false,
				]);
			} catch (error) {
				throw MakeTerminalProblem(error);
			}
		},

		Hide: async (id) => {
			try {
				await IPCService.invoke(Channel.TerminalHide)([id]);
			} catch (error) {
				throw MakeTerminalProblem(error);
			}
		},
	};

	return Service;
}

export const LiveTerminalService = makeLiveTerminalService();

export default LiveTerminalService;
