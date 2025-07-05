/**
 * @module Storage
 * @description
 * This module provides an Effect-native implementation of the `IStorage`
 * interface from VS Code. This class acts as the backing database for the
 * `StorageService`, delegating all I/O to the native host.
 */

import {
	type Event,
	type IStorage,
	type IStorageChangeEvent,
	type IUpdateRequest,
	type StorageValue,
} from "@codeeditorland/output/vs/base/parts/storage/common/storage.js";
import { Effect } from "effect";

import { CreateEmitter } from "../../Platform/Vscode/Type.js";
import { IntegrationService } from "../Integration/Define.js";
import type { StorageDatabase } from "./Database.js";
import { StorageProblem } from "./Problem.js";

/**
 * An `IStorage` implementation that delegates all operations to a remote
 * database via the `IntegrationService`. This class bridges the gap between
 * VS Code's synchronous storage interface and our asynchronous, Effect-based
 * backend communication.
 */
export class EffectStorage implements IStorage {
	private readonly _OnDidChangeStorageEmitter =
		CreateEmitter<IStorageChangeEvent>();
	public readonly onDidChangeStorage: Event<IStorageChangeEvent> =
		this._OnDidChangeStorageEmitter.event;

	constructor(
		private readonly Database: StorageDatabase,
		private readonly Integration: IntegrationService,
	) {
		// Listen for external changes from the host and fire them locally.
		const ListenEffect = this.Integration.Listen<IStorageChangeEvent>(
			`storage://did-change/${Database.Name}`,
			(Event) => {
				if (Event.payload) {
					this._OnDidChangeStorageEmitter.fire(Event.payload);
				}
			},
		);
		Effect.runFork(ListenEffect);
	}

	// The `IStorage` interface requires `items` and `size` to be synchronous getters.
	// This is a necessary compromise where we must run the Effect synchronously.
	// In a fully native Effect application, these would return an Effect.

	public get items(): Map<string, string> {
		const GetItemsEffect = this.Integration.Invoke<[string, string][]>(
			"Storage.GetItems",
			{ DatabaseName: this.Database.Name },
		);
		return new Map(Effect.runSync(Effect.orDie(GetItemsEffect)));
	}

	public get size(): number {
		return this.items.size;
	}

	public get(key: string, fallbackValue: string): string;
	public get(key: string, fallbackValue?: string): string | undefined {
		const value = this.items.get(key);
		return value ?? fallbackValue;
	}

	public set(key: string, value: StorageValue): Promise<void> {
		const request: IUpdateRequest =
			value === undefined
				? { deleted: new Set([key]), inserted: new Map() }
				: {
						deleted: new Set(),
						inserted: new Map([[key, value as string]]),
					};
		return this.update(request);
	}

	public delete(key: string): Promise<void> {
		return this.update({
			deleted: new Set([key]),
			inserted: new Map(),
		});
	}

	public update(request: IUpdateRequest): Promise<void> {
		const UpdateEffect = this.Integration.Invoke<void>(
			"Storage.UpdateItems",
			{
				DatabaseName: this.Database.Name,
				Request: request,
			},
		).pipe(
			Effect.mapError(
				(Cause) =>
					new StorageProblem({ Cause, Context: "UpdateItemsFailed" }),
			),
		);
		return Effect.runPromise(UpdateEffect);
	}

	public init(): Promise<void> {
		const InitEffect = this.Integration.Invoke<void>("Storage.Init", {
			DatabaseName: this.Database.Name,
			Path: this.Database.Path,
		}).pipe(
			Effect.mapError(
				(Cause) => new StorageProblem({ Cause, Context: "InitFailed" }),
			),
		);
		return Effect.runPromise(InitEffect);
	}

	public close(): Promise<void> {
		this._OnDidChangeStorageEmitter.dispose();
		return Promise.resolve();
	}

	public optimize(): Promise<void> {
		// Optimize is a host-side concept.
		return Promise.resolve();
	}
}
