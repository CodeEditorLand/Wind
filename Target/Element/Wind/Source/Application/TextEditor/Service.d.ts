/**
 * @module Service (Application/TextEditor)
 * @description Defines the service interface and `Effect.Service` tag for the
 * `ITextFileService`, which is responsible for managing text file models.
 * NOTE: The service was renamed from `ITextEditorService` to reflect the
 * VS Code service it implements (`textFileService.ts`).
 */
import { Effect } from "effect";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles.js";
declare const TextEditorService_base: Effect.Service.Class<ITextFileService, "textFileService", {
    readonly effect: Effect.Effect<ITextFileService, unknown, unknown>;
}>;
/**
 * The `Effect.Service` for the `ITextFileService`.
 *
 * This service implementation "lifts" the original `TextFileService` class from
 * VS Code's source. The key modification is overriding the `save` method to
 * delegate the save operation to our `HostService`, which communicates with the
 * native `Mountain` backend. All other dependencies are resolved from the DI
 * container, showcasing the hybrid DI model.
 */
export declare class TextEditorService extends TextEditorService_base {
}
export {};
