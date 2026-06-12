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

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { KeybindingService } from "./Interface/KeybindingService.js";
import type { KeybindingProblem } from "./Type/KeybindingProblem.js";

const MakeKeybindingProblem = (error: unknown): KeybindingProblem => ({
	_tag: "KeybindingOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

function makeKeybindingService(): KeybindingService {
	const IPCService = TauriIPCLive;

	const Service: KeybindingService = {
		AddKeybinding: async (commandId, keybinding, when) => {
			try {
				await IPCService.invoke(Channel.KeybindingAdd)([
					commandId,
					keybinding,
					when ?? null,
				]);
			} catch (error) {
				throw MakeKeybindingProblem(error);
			}
		},

		RemoveKeybinding: async (commandId) => {
			try {
				await IPCService.invoke(Channel.KeybindingRemove)([commandId]);
			} catch (error) {
				throw MakeKeybindingProblem(error);
			}
		},

		LookupKeybinding: async (commandId) => {
			try {
				const Result = await IPCService.invoke(Channel.KeybindingLookup)([commandId]);
				return typeof Result === "string" ? Result : null;
			} catch (error) {
				throw MakeKeybindingProblem(error);
			}
		},

		GetKeybindings: async () => {
			try {
				const Result = await IPCService.invoke(Channel.KeybindingGetAll)([]);
				return Array.isArray(Result)
					? (Result as ReadonlyArray<{
							commandId: string;
							keybinding: string;
							when?: string;
						}>)
					: [];
			} catch (error) {
				throw MakeKeybindingProblem(error);
			}
		},
	};

	return Service;
}

export const LiveKeybindingService = makeKeybindingService();

export default LiveKeybindingService;
