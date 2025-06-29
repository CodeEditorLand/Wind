/**
 * @module Service (Application/EditorGroup)
 * @description Defines the service interface and live implementation for the
 * application-level editor groups service, which conforms to the `IEditorGroupService`
 * contract from VS Code.
 */
import { Effect } from "effect";
/**
 * Represents the serializable state of the editor grid UI.
 */
export interface IEditorPartUIState {
    readonly SerializedGrid: any;
    readonly ActiveGroup: number;
    readonly MostRecentActiveGroups: number[];
}
declare const EditorGroupService_base: Effect.Service.Class<IEditorGroupService, "vscode/EditorGroupService", {
    readonly effect: Effect.Effect<IEditorGroupService, unknown, unknown>;
}>;
/**
 * The `Effect.Service` for the `IEditorGroupService`.
 *
 * This service manages the editor grid layout, including the creation, removal,
 * and state management of editor groups. It persists its state to the `IStorageService`.
 */
export declare class EditorGroupService extends EditorGroupService_base {
}
export {};
