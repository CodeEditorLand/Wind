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

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { CommandsService } from "./Interface/CommandsService.js";
import { CommandsServiceTag } from "./Tag/CommandsServiceTag.js";
import type { CommandsProblem } from "./Type/CommandsProblem.js";

const MakeCommandsOperationFailed = (error: unknown): CommandsProblem => ({
	_tag: "CommandsOperationFailed",
	error: error instanceof Error ? error : new Error(String(error)),
});

function makeCommandsService(): CommandsService {
	const IPCService = TauriIPCLive;

	// Local handler registry for UI-side commands (registered from Wind/Sky).
	// Handlers registered here execute directly without an IPC round-trip.
	const LocalHandlers = new Map<
		string,
		(...args: readonly unknown[]) => unknown
	>();

	const Service: CommandsService = {
		RegisterCommand: (id, handler) =>
			Effect.sync(() => {
				LocalHandlers.set(id, handler);
			}),

		ExecuteCommand: <T = unknown>(
			id: string,
			...args: readonly unknown[]
		): Effect.Effect<T, CommandsProblem> => {
			// Check local handlers first (UI-side commands execute synchronously)
			const LocalHandler = LocalHandlers.get(id);

			if (LocalHandler !== undefined) {
				return Effect.try({
					try: () => LocalHandler(...args) as T,
					catch: MakeCommandsOperationFailed,
				});
			}

			// Delegate to Mountain's CommandRegistry via IPC
			return IPCService.invoke(Channel.CommandsExecute)([
				id,

				args[0] ?? null,
			]).pipe(
				Effect.map((Result) => Result as T),

				Effect.mapError(MakeCommandsOperationFailed),
			);
		},

		UnregisterCommand: (id) =>
			Effect.sync(() => {
				LocalHandlers.delete(id);
			}),

		GetCommands: () =>
			IPCService.invoke(Channel.CommandsGetAll)([]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result) ? (Result as readonly string[]) : [],
				),

				Effect.mapError(MakeCommandsOperationFailed),
			),
	};

	return Service;
}

export const CommandsServiceInstance = makeCommandsService();

export const LiveCommandsServiceLayer = Layer.succeed(
	CommandsServiceTag,

	CommandsServiceInstance,
);

export default LiveCommandsServiceLayer;
