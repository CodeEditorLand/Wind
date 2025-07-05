/**
 * @module Storage (Application/Storage)
 * @description Provides an Effect-native implementation of the `IStorage`
 * interface, which acts as the backing database for the `StorageService`.
 */
import { type IStorage, type IStorageChangeEvent, type IUpdateRequest, type StorageValue } from "@codeeditorland/output/vs/base/parts/storage/common/storage.js";
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
    getBoolean(key: string, fallbackValue: boolean): boolean;
    getBoolean(key: string, fallbackValue?: boolean): boolean | undefined;
    getNumber(key: string, fallbackValue: number): number;
    getNumber(key: string, fallbackValue?: number): number | undefined;
    getObject<T extends object>(key: string, fallbackValue: T): T;
    getObject<T extends object>(key: string, fallbackValue?: T): T | undefined;
    whenFlushed(): Promise<void>;
    dispose(): void;
    get items(): Map<string, string>;
    get size(): number;
    get(key: string, fallbackValue: string): string;
    set(key: string, value: StorageValue, _external?: boolean): Promise<void>;
    delete(key: string, _external?: boolean): Promise<void>;
    update(request: IUpdateRequest): Promise<void>;
    init(): Promise<void>;
    close(): Promise<void>;
    flush(): Promise<void>;
    optimize(): Promise<void>;
}
//# sourceMappingURL=Storage.d.ts.map