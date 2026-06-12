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

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";

import { TauriIPCLive } from "../IPC/index.js";

import type { TerminalService } from "./Interface/TerminalService.js";

import { TerminalServiceTag } from "./Tag/TerminalServiceTag.js";

import type { TerminalProblem } from "./Type/TerminalProblem.js";

const MakeTerminalProblem = (error: unknown): TerminalProblem =>
	error instanceof Error
		? { _tag: "TerminalOperationFailed", error }

		: { _tag: "TerminalOperationFailed", error: new Error(String(error)) };

function makeLiveTerminalService(): TerminalService {

	const IPCService = TauriIPCLive;

	const Service: TerminalService = {
		CreateTerminal: (options) =>
			IPCService.invoke(Channel.TerminalCreate)([options ?? {}]).pipe(
				Effect.map((Result) => {
					const Info = Result as { id?: number; name?: string };

					return {
						id: Info.id ?? 0,
						name: Info.name ?? "terminal",
					};
				}),

				Effect.mapError(MakeTerminalProblem),
			),

		SendText: (id, text) =>
			IPCService.invoke(Channel.TerminalSendText)([id, text]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeTerminalProblem),
			),

		Dispose: (id) =>
			IPCService.invoke(Channel.TerminalDispose)([id]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeTerminalProblem),
			),

		Show: (id, preserveFocus) =>
			IPCService.invoke(Channel.TerminalShow)([
				id,

				preserveFocus ?? false,
			]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeTerminalProblem),
			),

		Hide: (id) =>
			IPCService.invoke(Channel.TerminalHide)([id]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeTerminalProblem),
			),
	};

	return Service;
}

export const LiveTerminalServiceLayer = Layer.succeed(
	TerminalServiceTag,

	makeLiveTerminalService(),
);

export default LiveTerminalServiceLayer;
