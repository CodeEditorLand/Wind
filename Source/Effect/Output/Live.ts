/**
 * @module Effect/Output/Live
 * @description
 * Live implementation of OutputService backed by Mountain's output channel
 * infrastructure via Tauri IPC.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   output:create      → create channel (Sky renders panel)
 *   output:append      → emit to Sky output panel
 *   output:appendLine  → emit to Sky output panel (with newline)
 *   output:clear       → clear output panel
 *   output:show        → show output panel
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { IPC } from "../IPC.js";
import type { OutputService } from "./Interface/OutputService.js";
import { OutputServiceTag } from "./Tag/OutputServiceTag.js";
import type { OutputProblem } from "./Type/OutputProblem.js";

const MakeOutputProblem = (error: unknown): OutputProblem =>
	error instanceof Error
		? { _tag: "OutputOperationFailed", error }
		: { _tag: "OutputOperationFailed", error: new Error(String(error)) };

export const LiveOutputServiceLayer = Layer.effect(
	OutputServiceTag,
	Effect.gen(function* () {
		const IPCService = yield* IPC;

		// Local set of active channel names for Dispose tracking
		const ActiveChannels = new Set<string>();

		const Service: OutputService = {
			CreateChannel: (name) =>
				IPCService.invoke(Channel.OutputCreate)([name]).pipe(
					Effect.map(() => {
						ActiveChannels.add(name);
						return { name };
					}),
					Effect.mapError(MakeOutputProblem),
				),

			Append: (channelName, text) =>
				IPCService.invoke(Channel.OutputAppend)([channelName, text]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeOutputProblem),
				),

			AppendLine: (channelName, line) =>
				IPCService.invoke(Channel.OutputAppendLine)([
					channelName,
					line,
				]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeOutputProblem),
				),

			Clear: (channelName) =>
				IPCService.invoke(Channel.OutputClear)([channelName]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeOutputProblem),
				),

			Show: (channelName) =>
				IPCService.invoke(Channel.OutputShow)([channelName]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeOutputProblem),
				),

			Dispose: (channelName) =>
				Effect.sync(() => {
					ActiveChannels.delete(channelName);
				}),
		};

		return Service;
	}),
);

export default LiveOutputServiceLayer;
