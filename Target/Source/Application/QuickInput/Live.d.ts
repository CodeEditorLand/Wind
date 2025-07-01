/**
 * @module Live (Application/QuickInput)
 * @description Provides the "live" implementation `Layer` for the QuickInput service.
 */
import { Layer } from "effect";

import { HostService } from "../Host/Service.js";
import { QuickInputService } from "./Service.js";

/**
 * The live implementation `Layer` for the `QuickInputService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `QuickInputService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as the `HostService`.
 */
export declare const QuickInputLive: Layer.Layer<
	QuickInputService,
	never,
	HostService
>;
