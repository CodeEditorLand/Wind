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
				IPCService.invoke("output:create")([name]).pipe(
					Effect.map(() => {
						ActiveChannels.add(name);
						return { name };
					}),
					Effect.mapError(MakeOutputProblem),
				),

			Append: (channelName, text) =>
				IPCService.invoke("output:append")([channelName, text]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeOutputProblem),
				),

			AppendLine: (channelName, line) =>
				IPCService.invoke("output:appendLine")([
					channelName,
					line,
				]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeOutputProblem),
				),

			Clear: (channelName) =>
				IPCService.invoke("output:clear")([channelName]).pipe(
					Effect.map(() => undefined as void),
					Effect.mapError(MakeOutputProblem),
				),

			Show: (channelName) =>
				IPCService.invoke("output:show")([channelName]).pipe(
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
