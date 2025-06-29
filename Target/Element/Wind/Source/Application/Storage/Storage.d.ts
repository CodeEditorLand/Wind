/**
 * @module Storage (Application/Storage)
 * @description Provides an Effect-native implementation of the `IStorage`
 * interface, which acts as the backing database for the `StorageService`.
 */
import { type Event } from "vs/base/common/event.js";
import { type IStorage, type IStorageChangeEvent, type IUpdateRequest } from "vs/base/parts/storage/common/storage.js";
import { IntegrationService } from "../../Integration/Tauri/Service.js";
import type { StorageDatabase } from "./Database.js";
/**
 * An `IStorage` implementation that delegates all operations to a remote
 * database via the `IntegrationService`. This class bridges the gap between
 * VS Code's synchronous storage interface and our asynchronous, Effect-based
 * backend communication.
 */
export declare class EffectStorage implements IStorage {
    private readonly Database;
    private readonly Integration;
    private readonly OnDidChangeStorageEmitter;
    readonly onDidChangeStorage: Event<IStorageChangeEvent>;
    constructor(Database: StorageDatabase, Integration: IntegrationService);
    get items(): Map<string, string>;
    get size(): number;
    get(key: string, fallbackValue: string): string;
    set(key: string, value: string | undefined): void;
    delete(key: string): void;
    update(request: IUpdateRequest): void;
    init(): Promise<void>;
    close(): Promise<void>;
    flush(): Promise<void>;
    optimize(): Promise<void>;
}
