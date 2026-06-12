/**
 * @module Effect/Commands/Live
 * @description
 * Live implementation of CommandsService backed by Mountain's CommandRegistry
 * via Tauri IPC. Local UI-side handlers are stored in a Map and executed
 * directly; Mountain-side (extension) commands are delegated via IPC.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   commands:execute  → ExecuteCommand(id, arg)
 *   commands:getAll   → GetAllCommands()
 */

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { CommandsService } from "./Interface/CommandsService.js";

function makeCommandsService(): CommandsService {
	const IPCService = TauriIPCLive;

	// Local handler registry for UI-side commands (registered from Wind/Sky).
	// Handlers registered here execute directly without an IPC round-trip.
	const LocalHandlers = new Map<
		string,
		(...args: readonly unknown[]) => unknown
	>();

	const Service: CommandsService = {
		RegisterCommand: (id, handler) => {
			LocalHandlers.set(id, handler);
		},

		ExecuteCommand: async <T = unknown>(
			id: string,
			...args: readonly unknown[]
		): Promise<T> => {
			// Check local handlers first (UI-side commands execute synchronously)
			const LocalHandler = LocalHandlers.get(id);

			if (LocalHandler !== undefined) {
				return LocalHandler(...args) as T;
			}

			// Delegate to Mountain's CommandRegistry via IPC
			const Result = await IPCService.invoke(Channel.CommandsExecute, [
				id,

				args[0] ?? null,
			]);

			return Result as T;
		},

		UnregisterCommand: (id) => {
			LocalHandlers.delete(id);
		},

		GetCommands: async (): Promise<readonly string[]> => {
			const Result = await IPCService.invoke(
				Channel.CommandsGetAll,

				[],
			);

			return Array.isArray(Result) ? (Result as readonly string[]) : [];
		},
	};

	return Service;
}

export const CommandsServiceInstance = makeCommandsService();

export default CommandsServiceInstance;
