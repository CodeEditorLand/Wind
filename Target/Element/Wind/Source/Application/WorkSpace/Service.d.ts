/**
 * @module Service (Application/WorkSpace)
 * @description Defines the service that implements the `vscode.workspace` API.
 * It manages workspace-level state (folders, configuration) and editor state.
 */
import { Effect } from "effect";
import { WorkspaceService as VscWorkspaceService } from "vs/workbench/services/configuration/browser/configurationService.js";
import type { IWorkspaceContextService } from "vs/platform/workspace/common/workspace.js";
declare const WorkSpaceService_base: Effect.Service.Class<IWorkspaceContextService, "workspaceContextService", {
    readonly effect: Effect.Effect<VscWorkspaceService, unknown, unknown>;
}>;
/**
 * The `Effect.Service` for the `IWorkspaceContextService`.
 *
 * This service implementation "lifts" the original `WorkspaceService` class from
 * VS Code. It provides the complex logic for managing workspace state, folders,
 * and configuration scoping. The service is instantiated with its required
 * dependencies, which are resolved from our Effect-TS context via the DI bridge.
 * The identifier "workspaceContextService" is used for compatibility with legacy
 * VS Code service lookups.
 */
export declare class WorkSpaceService extends WorkSpaceService_base {
}
export {};
