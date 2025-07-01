/**
 * @module Storage (Application/Storage)
 * @description Provides an Effect-native implementation of the `IStorage`
 * interface, which acts as the backing database for the `StorageService`.
 */

import { Effect } from "effect";
import { Emitter, type Event } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/common/event.js";
import {
	type IStorage,
	type IStorageChangeEvent,
	type IUpdateRequest,
	type StorageValue,
} from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/parts/storage/common/storage.js";

import { IntegrationService } from "../../Integration/Tauri/Service.js";
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
		this.OnDidChangeStorageEmitter.event;

	constructor(
		private readonly Database: StorageDatabase,
		private readonly Integration: IntegrationService,
	) {
		// Listen for external changes from the host
		const ListenEffect = this.Integration.Listen<IStorageChangeEvent>(
			`storage://did-change/${Database.Name}`,
			(Event) => {
				if (Event.payload) {
					this.OnDidChangeStorageEmitter.fire(Event.payload);
				}
			},
		);
		Effect.runFork(ListenEffect);
	}
	getBoolean(key: string, fallbackValue: boolean): boolean;
	getBoolean(key: string, fallbackValue?: boolean): boolean | undefined;
	getBoolean(key: unknown, fallbackValue?: unknown): boolean | undefined {
		throw new Error("Method not implemented.");
	}
	getNumber(key: string, fallbackValue: number): number;
	getNumber(key: string, fallbackValue?: number): number | undefined;
	getNumber(key: unknown, fallbackValue?: unknown): number | undefined {
		throw new Error("Method not implemented.");
	}
	getObject<T extends object>(key: string, fallbackValue: T): T;
	getObject<T extends object>(key: string, fallbackValue?: T): T | undefined;
	getObject(key: unknown, fallbackValue?: unknown): T | T | undefined {
		throw new Error("Method not implemented.");
	}
	whenFlushed(): Promise<void> {
		throw new Error("Method not implemented.");
	}
	dispose(): void {
		throw new Error("Method not implemented.");
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

	set(key: string, value: StorageValue, _external?: boolean): Promise<void> {
		const request: IUpdateRequest =
			value === undefined
				? { deleted: new Set([key]), inserted: new Map() }
				: {
						deleted: new Set(),
						inserted: new Map([[key, value as string]]),
					};
		return this.update(request);
	}

	delete(key: string, _external?: boolean): Promise<void> {
		return this.update({
			deleted: new Set([key]),
			inserted: new Map(),
		});
	}

	update(request: IUpdateRequest): Promise<void> {
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
		return Effect.runPromise(UpdateEffect);
	}

	init(): Promise<void> {
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

	close(): Promise<void> {
		// Close logic would be handled by the host.
		// We just dispose the emitter.
		this.OnDidChangeStorageEmitter.dispose();
		return Promise.resolve();
	}

	flush(): Promise<void> {
		// Flush is a host-side concept in this architecture.
		return Promise.resolve();
	}

	optimize(): Promise<void> {
		// Optimize is a host-side concept.
		return Promise.resolve();
	}
}
