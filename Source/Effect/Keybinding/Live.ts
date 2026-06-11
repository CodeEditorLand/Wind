/**
 * @module Effect/Keybinding/Live
 * @description
 * Live implementation of KeybindingService backed by Mountain's keybinding
 * registry via Tauri IPC. Allows Wind components and extensions to register
 * dynamic keyboard shortcuts at runtime.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   keybinding:add      → register a dynamic keybinding
 *   keybinding:remove   → unregister keybinding for a command
 *   keybinding:lookup   → resolve keybinding string for a command
 *   keybinding:getAll   → list all registered dynamic keybindings
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { KeybindingService } from "./Interface/KeybindingService.js";
import { KeybindingServiceTag } from "./Tag/KeybindingServiceTag.js";
import type { KeybindingProblem } from "./Type/KeybindingProblem.js";

const MakeKeybindingProblem = (error: unknown): KeybindingProblem => ({
	_tag: "KeybindingOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

function makeKeybindingService(): KeybindingService {
	const IPCService = TauriIPCLive;

	const Service: KeybindingService = {
		AddKeybinding: (commandId, keybinding, when) =>
			IPCService.invoke(Channel.KeybindingAdd)([
				commandId,

				keybinding,

				when ?? null,
			]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeKeybindingProblem),
			),

		RemoveKeybinding: (commandId) =>
			IPCService.invoke(Channel.KeybindingRemove)([commandId]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeKeybindingProblem),
			),

		LookupKeybinding: (commandId) =>
			IPCService.invoke(Channel.KeybindingLookup)([commandId]).pipe(
				Effect.map((Result) =>
					typeof Result === "string" ? Result : null,
				),

				Effect.mapError(MakeKeybindingProblem),
			),

		GetKeybindings: () =>
			IPCService.invoke(Channel.KeybindingGetAll)([]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result)
						? (Result as ReadonlyArray<{
								commandId: string;

								keybinding: string;

								when?: string;
							}>)
						: [],
				),

				Effect.mapError(MakeKeybindingProblem),
			),
	};

	return Service;
}

export const LiveKeybindingServiceLayer = Layer.succeed(
	KeybindingServiceTag,

	makeKeybindingService(),
);

export default LiveKeybindingServiceLayer;
