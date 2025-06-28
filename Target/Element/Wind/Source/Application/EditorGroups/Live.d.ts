/**
 * @module Live (Application/EditorGroups)
 * @description Provides the "live" implementation `Layer` for the EditorGroups service.
 */
import { Layer } from "effect";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { IStorageService } from "vs/platform/storage/common/storage.js";
import { EditorGroupsService } from "./Service.js";
/**
 * The live implementation `Layer` for the `EditorGroupsService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `EditorGroupsService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, which are the
 * `IInstantiationService` and `IStorageService`.
 */
export declare const EditorGroupsLive: Layer.Layer<EditorGroupsService, never, IInstantiationService | IStorageService>;
