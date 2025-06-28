/**
 * @module Service (Application/EditorGroups)
 * @description Defines the service interface and live implementation for the
 * application-level editor groups service, which conforms to the `IEditorGroupsService`
 * contract from VS Code.
 */
import { Effect } from "effect";
import { type IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService.js";
declare const EditorGroupsService_base: Effect.Service.Class<IEditorGroupsService, "vscode/EditorGroupsService", {
    readonly effect: Effect.Effect<IEditorGroupsService, unknown, unknown>;
}>;
/**
 * The `Effect.Service` for the `IEditorGroupsService`.
 *
 * This service manages the editor grid layout, including the creation, removal,
 * and state management of editor groups. It persists its state to the `IStorageService`.
 */
export declare class EditorGroupsService extends EditorGroupsService_base {
}
export {};
