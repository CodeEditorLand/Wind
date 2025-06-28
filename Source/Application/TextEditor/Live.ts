/**
 * @module Live (Application/TextEditor)
 * @description Provides the "live" implementation `Layer` for the TextEditor service.
 */

import { Layer } from "effect";
import { TextEditorService } from "./Service.js";

/**
 * The live implementation `Layer` for the `TextEditorService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `TextEditorService` service definition. It automatically includes all
 * dependencies required by its `effect` constructor.
 */
export const TextEditorLive: Layer.Layer<TextEditorService> =
	TextEditorService.Default;
