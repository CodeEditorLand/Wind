/**
 * @module Live (Application/QuickInput)
 * @description Provides the "live" implementation `Layer` for the QuickInput service.
 */

import { Layer } from "effect";
import { QuickInputService } from "./Service.js";

/**
 * The live implementation `Layer` for the `QuickInputService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `QuickInputService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as the `HostService`.
 */
export const QuickInputLive: Layer.Layer<QuickInputService> =
	QuickInputService.Default;
