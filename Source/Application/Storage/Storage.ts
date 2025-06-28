/**
 * @module Storage (Application/Storage)
 * @description Provides an Effect-native implementation of the `IStorage`
 * interface, which acts as the backing database for the `StorageService`.
 */

import { Effect } from "effect";
import { Emitter, type Event } from "vs/base/common/event.js";
import {
	type IStorage,
	type IStorageChangeEvent,
	type IUpdateRequest,
	StorageHint,
} from "vs/base/parts/storage/common/storage.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import type { StorageDatabase } from "./Database.js";
import { StorageProblem } from "./Error.js";

/**
 * An `IStorage` implementation that delegates all operations to a remote
 * database via the `IntegrationService`. This class bridges the gap between
 * VS Code's synchronous storage interface and our asynchronous, Effect-based
 * backend communication.
 */
export class EffectStorage implements IStorage {
	private readonly OnDidChangeStorageEmitter =
		new Emitter<IStorageChangeEvent>();
	public readonly onDidChangeStorage: Event<IStorageChangeEvent> =
		this.onDidChangeStorageEmitter.event;

	constructor(
		private readonly Database: StorageDatabase,
		private readonly Integration: IntegrationService,
	) {
		// Listen for external changes from the host
		const ListenEffect = Integration.Listen<IStorageChangeEvent>(
			`storage://did-change/${Database.Name}`,
			(Event) => {
				if (Event.payload) {
					this.OnDidChangeStorageEmitter.fire(Event.payload);
				}
			},
		);
		Effect.runFork(ListenEffect);
	}

	get items(): Map<string, string> {
		const GetItemsEffect = this.Integration.Invoke<[string, string][]>(
			"Storage.GetItems",
			{ DatabaseName: this.Database.Name },
		);
		// This is a synchronous boundary required by the IStorage interface.
		// A full implementation might require an initialization phase to pre-fetch.
		return new Map(Effect.runSync(Effect.orDie(GetItemsEffect)));
	}

	get size(): number {
		return this.items.size;
	}

	get(key: string, fallbackValue: string): string;
	get(key: string, fallbackValue?: string): string | undefined {
		const value = this.items.get(key);
		return value ?? fallbackValue;
	}

	set(key: string, value: string | undefined): void {
		const request: IUpdateRequest =
			value === undefined
				? { delete: [key] }
				: { insert: new Map([[key, value]]) };
		this.update(request);
	}

	delete(key: string): void {
		this.update({ delete: [key] });
	}

	update(request: IUpdateRequest): void {
		const UpdateEffect = this.Integration.Invoke<void>(
			"Storage.UpdateItems",
			{ DatabaseName: this.Database.Name, Request: request },
		).pipe(
			Effect.mapError(
				(Cause) =>
					new StorageProblem({ Cause, Context: "UpdateItemsFailed" }),
			),
		);
		// Fire-and-forget the update operation.
		Effect.runFork(UpdateEffect);
	}

	async init(): Promise<void> {
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

	async close(): Promise<void> {
		// Close logic would be handled by the host.
		// We just dispose the emitter.
		this.OnDidChangeStorageEmitter.dispose();
	}

	async flush(): Promise<void> {
		// Flush is a host-side concept in this architecture.
		return Promise.resolve();
	}

	optimize(): Promise<void> {
		// Optimize is a host-side concept.
		return Promise.resolve();
	}
}
