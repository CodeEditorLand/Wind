/**
 * @module Live (Integration/Tauri)
 * @description Provides the live implementation `Layer` for the Integration service.
 */
import { Layer } from "effect";

import { IntegrationService } from "./Service.js";

/**
 * The live implementation `Layer` for the `IntegrationService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition.
 */
export declare const IntegrationLive: Layer.Layer<IntegrationService>;
