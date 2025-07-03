/**
 * @module Service (Application/Storage)
 * @description Defines the service for providing persistent, scoped key-value
 * storage (`Memento`) for extensions, conforming to `IStorageService`.
 */
import { Effect } from "effect";
import type { IStorage } from "@codeeditorland/output/vs/base/parts/storage/common/storage.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { AbstractStorageService, StorageScope, type IStorageService } from "@codeeditorland/output/vs/platform/storage/common/storage.js";
import { type IUserDataProfile } from "@codeeditorland/output/vs/platform/userDataProfile/common/userDataProfile.js";
import type { IAnyWorkspaceIdentifier } from "@codeeditorland/output/vs/platform/workspace/common/workspace.js";
import { IntegrationService } from "../../Integration/Tauri/Service.js";
/**
 * An implementation of `AbstractStorageService` that uses `EffectStorage` as its
 * backing store. This class orchestrates the creation and management of different
 * storage scopes (Application, Profile, Workspace) by creating distinct
 * `EffectStorage` instances for each.
 */
export declare class EffectStorageService extends AbstractStorageService {
    private readonly Integration;
    private readonly LoggerService;
    constructor(Integration: IntegrationService, LoggerService: ILogService);
    protected getStorage(scope: StorageScope): IStorage | undefined;
    protected getLogDetails(scope: StorageScope): string | undefined;
    protected doInitialize(): Promise<void>;
    protected switchToProfile(toProfile: IUserDataProfile, _preserveData: boolean): Promise<void>;
    protected switchToWorkspace(toWorkspace: IAnyWorkspaceIdentifier, _preserveData: boolean): Promise<void>;
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
//# sourceMappingURL=Service.d.ts.map