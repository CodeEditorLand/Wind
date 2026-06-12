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

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { StorageService } from "./Interface/StorageService.js";
import type { StorageProblem } from "./Type/StorageProblem.js";

const MakeStorageProblem = (error: unknown): StorageProblem =>
	error instanceof Error
		? { _tag: "StorageOperationFailed", error }
		: { _tag: "StorageOperationFailed", error: new Error(String(error)) };

export const LiveStorageService: StorageService = {
	Get: (key) => {
		try {
			const Result = TauriIPCLive.invoke(Channel.StorageGet, [key]);

			void (Result as Promise<unknown>).catch(() => {});

			return undefined;
		} catch (error) {
			throw MakeStorageProblem(error);
		}
	},

	Set: (key, value) => {
		try {
			const Result = TauriIPCLive.invoke(Channel.StorageSet, [
				key,

				value,
			]);

			void (Result as Promise<unknown>).catch(() => {});
		} catch (error) {
			throw MakeStorageProblem(error);
		}
	},

	Delete: (key) => {
		try {
			const Result = TauriIPCLive.invoke(Channel.StorageDelete, [key]);

			void (Result as Promise<unknown>).catch(() => {});
		} catch (error) {
			throw MakeStorageProblem(error);
		}
	},

	Keys: () => {
		try {
			const Result = TauriIPCLive.invoke(Channel.StorageKeys, []);

			void (Result as Promise<unknown>).catch(() => {});

			return [];
		} catch (error) {
			throw MakeStorageProblem(error);
		}
	},

	GetItems: () => {
		try {
			const Result = TauriIPCLive.invoke(Channel.StorageGetItems, []);

			void (Result as Promise<unknown>).catch(() => {});

			return [];
		} catch (error) {
			throw MakeStorageProblem(error);
		}
	},

	UpdateItems: (request) => {
		try {
			const Result = TauriIPCLive.invoke(Channel.StorageUpdateItems, [
				request,
			]);

			void (Result as Promise<unknown>).catch(() => {});
		} catch (error) {
			throw MakeStorageProblem(error);
		}
	},

	Optimize: () => {
		try {
			const Result = TauriIPCLive.invoke(Channel.StorageOptimize, []);

			void (Result as Promise<unknown>).catch(() => {});
		} catch (error) {
			throw MakeStorageProblem(error);
		}
	},
};

export default LiveStorageService;
