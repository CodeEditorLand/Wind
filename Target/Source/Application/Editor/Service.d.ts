/**
 * @module Service (Application/Editor)
 * @description Defines the service interface and `Effect.Service` tag for the
 * `IEditorService`, which is responsible for managing editor panes and opening editors.
 */
import { Effect } from "effect";
declare const EditorService_base: Effect.Service.Class<IEditorService, "vscode/EditorService", {
    readonly effect: Effect.Effect<IEditorService, never, any>;
}>;
/**
 * The `Effect.Service` for the `IEditorService`.
 *
 * This service implementation bridges the gap between the workbench's requests
 * to open editors and the native host's capabilities. It translates editor inputs
 * into file URIs and delegates the actual "open" command to the `HostService`.
 */
export declare class EditorService extends EditorService_base {
}
export {};
