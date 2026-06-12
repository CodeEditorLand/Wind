/**
 * @module Effect/Storage/Live
 * @description
 * Live implementation of StorageService backed by Mountain's storage provider
 * via Tauri IPC. Persistent key-value store (survives app restarts).
 *
 * IPC channels (WindServiceHandlers.rs):
 *   storage:get         → StorageProvider::GetItem(key)
 *   storage:set         → StorageProvider::SetItem(key, value)
 *   storage:delete      → StorageProvider::DeleteItem(key)
 *   storage:keys        → StorageProvider::GetKeys()
 *   storage:getItems    → bulk read as [key, value] tuples
 *   storage:updateItems → bulk { insert, delete } in one round-trip
 *   storage:optimize    → flush the store
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";

import { TauriIPCLive } from "../IPC/index.js";

import type { StorageService } from "./Interface/StorageService.js";

import { StorageServiceTag } from "./Tag/StorageServiceTag.js";

import type { StorageProblem } from "./Type/StorageProblem.js";

const MakeStorageProblem = (error: unknown): StorageProblem =>
	error instanceof Error
		? { _tag: "StorageOperationFailed", error }

		: { _tag: "StorageOperationFailed", error: new Error(String(error)) };

function makeStorageService(): StorageService {

	const IPCService = TauriIPCLive;

	const Service: StorageService = {
		Get: (key) =>
			IPCService.invoke(Channel.StorageGet)([key]).pipe(
				Effect.map((Result) => Result),

				Effect.mapError(MakeStorageProblem),
			),

		Set: (key, value) =>
			IPCService.invoke(Channel.StorageSet)([key, value]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeStorageProblem),
			),

		Delete: (key) =>
			IPCService.invoke(Channel.StorageDelete)([key]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeStorageProblem),
			),

		Keys: () =>
			IPCService.invoke(Channel.StorageKeys)([]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result) ? (Result as readonly string[]) : [],
				),

				Effect.mapError(MakeStorageProblem),
			),

		GetItems: () =>
			IPCService.invoke(Channel.StorageGetItems)([]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result)
						? (Result as readonly (readonly [string, string])[])
						: [],
				),

				Effect.mapError(MakeStorageProblem),
			),

		UpdateItems: (request) =>
			IPCService.invoke(Channel.StorageUpdateItems)([request]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeStorageProblem),
			),

		Optimize: () =>
			IPCService.invoke(Channel.StorageOptimize)([]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeStorageProblem),
			),
	};

	return Service;
}

export const LiveStorageServiceLayer = Layer.succeed(
	StorageServiceTag,

	makeStorageService(),
);

export default LiveStorageServiceLayer;
