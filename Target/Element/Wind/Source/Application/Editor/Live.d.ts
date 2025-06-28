/**
 * @module Live (Application/Editor)
 * @description Provides the "live" implementation `Layer` for the Editor service.
 */
import { Layer } from "effect";
import { EditorService } from "./Service.js";
/**
 * The live implementation `Layer` for the `EditorService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `EditorService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as `HostService`
 * and `TextEditorService`.
 */
export declare const EditorLive: Layer.Layer<EditorService>;
