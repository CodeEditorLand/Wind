/**
 * @module Live (Application/StatusBar)
 * @description Provides the "live" implementation `Layer` for the StatusBar service.
 */

import { Layer } from "effect";
import { StatusBarService } from "./Service.js";

/**
 * The live implementation `Layer` for the `StatusBarService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as the `HostService` and `CommandService`.
 */
export const StatusBarLive: Layer.Layer<StatusBarService> =
	StatusBarService.Default;
