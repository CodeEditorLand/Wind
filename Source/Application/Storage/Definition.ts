import { Cache, Effect, Fiber, Layer, Ref } from "effect";
import { InMemoryStorageDatabase } from "vs/base/parts/storage/common/storage.js";
import {
	AbstractStorageService,
	IStorage,
	IStorageService,
	StorageScope,
	StorageTarget,
} from "vs/platform/storage/common/storage";

import {
	InitializeStorage,
	RemoveStorageValue,
	SetStorageValue,
} from "../../Integration/Tauri.js";

// This is a simplified in-memory IStorage implementation for our cache.
class InMemoryStorage extends InMemoryStorageDatabase implements IStorage {
	// `IStorage` interface requires these, but our logic won't use them directly.
	readonly onDidChangeStorage = Effect.never;
	whenFlushed(): Promise<void> {
		return Promise.resolve();
	}
	close(): Promise<void> {
		return Promise.resolve();
	}
	async getItems(): Promise<Map<string, string>> {
		return this.items;
	}
	async updateItems(request: any): Promise<void> {
		// not implemented
	}
	optimize(): Promise<void> {
		return Promise.resolve();
	}
}

class TauriStorageService extends AbstractStorageService {
	private applicationStorage = new InMemoryStorage();
	private profileStorage = new InMemoryStorage();
	private workspaceStorage = new InMemoryStorage();

	private initializationFiber: Fiber.RuntimeFiber<void, any> | undefined;

	constructor() {
		super({ flushInterval: Infinity }); // We control flushing manually.

		const initializeEffect = Effect.gen(function* (_) {
			const initialData = yield* _(InitializeStorage());

			// Populate caches
			initialData.application.forEach((value, key) =>
				this.applicationStorage.set(key, value),
			);
			initialData.profile.forEach((value, key) =>
				this.profileStorage.set(key, value),
			);
			initialData.workspace.forEach((value, key) =>
				this.workspaceStorage.set(key, value),
			);

			// TODO: Set up Tauri event listeners for onDidChangeValue from backend
		}).pipe(
			Effect.catchAll((error) =>
				Effect.logError("Storage initialization failed", error),
			),
		);

		this.initializationFiber = Effect.runFork(initializeEffect);
	}

	protected getStorage(scope: StorageScope): IStorage | undefined {
		switch (scope) {
			case StorageScope.APPLICATION:
				return this.applicationStorage;
			case StorageScope.PROFILE:
				return this.profileStorage;
			case StorageScope.WORKSPACE:
				return this.workspaceStorage;
		}
	}

	override store(
		key: string,
		value: unknown,
		scope: StorageScope,
		target: StorageTarget,
	): void {
		super.store(key, value, scope, target);

		// Fire-and-forget update to the backend
		Effect.runFork(SetStorageValue({ scope, key, value, target }));
	}

	override remove(key: string, scope: StorageScope): void {
		super.remove(key, scope);

		// Fire-and-forget update to the backend
		Effect.runFork(RemoveStorageValue({ scope, key }));
	}

	// --- Other method implementations ---
	hasScope(scope: any): boolean {
		// This needs to be implemented based on workspace/profile context
		return true;
	}
	protected getLogDetails(scope: StorageScope): string | undefined {
		return `Tauri-backed (${StorageScope[scope]})`;
	}

	// The following are more complex and require more context services, stubbing for now.
	protected doInitialize(): Promise<void> {
		if (this.initializationFiber) {
			return Effect.runPromise(Fiber.join(this.initializationFiber));
		}
		return Promise.resolve();
	}
	protected switchToProfile(
		toProfile: any,
		preserveData: boolean,
	): Promise<void> {
		return Promise.reject(new Error("switchToProfile not implemented."));
	}
	protected switchToWorkspace(
		toWorkspace: any,
		preserveData: boolean,
	): Promise<void> {
		return Promise.reject(new Error("switchToWorkspace not implemented."));
	}
}

const Definition = Effect.sync(() => new TauriStorageService());

export default Definition;
