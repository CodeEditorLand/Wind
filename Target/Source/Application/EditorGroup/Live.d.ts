/**
 * @module Live (Application/EditorGroup)
 * @description Provides the "live" implementation `Layer` for the EditorGroup service.
 */
import { Layer } from "effect";
import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { IStorageService } from "@codeeditorland/output/vs/platform/storage/common/storage.js";
import { EditorGroupService } from "./Service.js";
/**
 * The live implementation `Layer` for the `EditorGroupService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `EditorGroupService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, which are the
 * `IInstantiationService` and `IStorageService`.
 */
export declare const EditorGroupLive: Layer.Layer<EditorGroupService, never, IInstantiationService | IStorageService>;
//# sourceMappingURL=Live.d.ts.map