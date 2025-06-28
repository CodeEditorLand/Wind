/**
 * @module Service (Application/Storage)
 * @description Defines the service for providing persistent, scoped key-value
 * storage (`Memento`) for extensions, conforming to `IStorageService`.
 */
import { Effect } from "effect";
import { AbstractStorageService } from "vs/platform/storage/common/storageService.js";
import type { IStorage, IStorageService, StorageScope } from "vs/platform/storage/common/storage.js";
import type { IAnyWorkspaceIdentifier } from "vs/platform/workspace/common/workspace.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { IUserDataProfile } from "vs/platform/userDataProfile/common/userDataProfile";
import { ILogService } from "vs/platform/log/common/log.js";
/**
 * An implementation of `AbstractStorageService` that uses `EffectStorage` as its
 * backing store. This class orchestrates the creation and management of different
 * storage scopes (Application, Profile, Workspace) by creating distinct
 * `EffectStorage` instances for each.
 */
declare class EffectStorageService extends AbstractStorageService {
    private readonly Integration;
    private readonly LogService;
    constructor(Integration: IntegrationService, LogService: ILogService);
    protected getStorage(scope: StorageScope): IStorage | undefined;
    protected getLogDetails(scope: StorageScope): string | undefined;
    protected doInitialize(): Promise<void>;
    protected switchToProfile(toProfile: IUserDataProfile, preserveData: boolean): Promise<void>;
    protected switchToWorkspace(toWorkspace: IAnyWorkspaceIdentifier, preserveData: boolean): Promise<void>;
    hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
}
declare const StorageService_base: Effect.Service.Class<IStorageService, "storageService", {
    readonly effect: Effect.Effect<EffectStorageService, unknown, unknown>;
}>;
/**
 * The `Effect.Service` for the `IStorageService`.
 *
 * This service is responsible for providing access to persistent key-value
 * storage. The implementation lifts `AbstractStorageService` from VS Code
 * and provides it with a custom `IStorage` backend (`EffectStorage`) that
 * routes all I/O operations through our `IntegrationService`.
 */
export declare class StorageService extends StorageService_base {
}
export {};
