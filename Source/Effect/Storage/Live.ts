/**
 * @module Effect/Storage/Live
 * @description
 * Live implementation of StorageService backed by Mountain's storage provider
 * via Tauri IPC. Persistent key-value store (survives app restarts).
 *
 * IPC channels (WindServiceHandlers.rs):
 *   storage:get    → StorageProvider::GetItem(key)
 *   storage:set    → StorageProvider::SetItem(key, value)
 *   storage:delete → StorageProvider::DeleteItem(key)
 *   storage:keys   → StorageProvider::GetKeys()
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { IPC } from "../IPC.js";
import type { StorageService } from "./Interface/StorageService.js";
import { StorageServiceTag } from "./Tag/StorageServiceTag.js";
import type { StorageProblem } from "./Type/StorageProblem.js";

const MakeStorageProblem = (error: unknown): StorageProblem =>
	error instanceof Error
		? { _tag: "StorageOperationFailed", error }
		: { _tag: "StorageOperationFailed", error: new Error(String(error)) };

export const LiveStorageServiceLayer = Layer.effect(
	StorageServiceTag,

	Effect.gen(function* () {
		const IPCService = yield* IPC;

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
						Array.isArray(Result)
							? (Result as readonly string[])
							: [],
					),

					Effect.mapError(MakeStorageProblem),
				),
		};

		return Service;
	}),
);

export default LiveStorageServiceLayer;
