/**
 * @module Live (Application/Document)
 * @description Provides the "live" implementation `Layer` for the Document service.
 */

import { Layer } from "effect";
import { DocumentService } from "./Service.js";

/**
 * The live implementation `Layer` for the `DocumentService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `DocumentService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as `IPCService` and `LoggerService`.
 */
export const DocumentLive: Layer.Layer<DocumentService> =
	DocumentService.Default;
