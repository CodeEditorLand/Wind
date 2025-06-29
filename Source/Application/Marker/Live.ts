/**
 * @module Live (Application/Marker)
 * @description Provides the "live" implementation `Layer` for the MarkerService.
 */

import { Layer } from "effect";
import { ILogService } from "vs/platform/log/common/log.js";

import { IntegrationService } from "../../Integration/Tauri/Service.js";
import { MarkerService } from "./Service.js";

/**
 * The live implementation `Layer` for the `MarkerService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as the `ILogService` and `IntegrationService`.
 */
export const MarkerLive: Layer.Layer<
	MarkerService,
	never,
	ILogService | IntegrationService
> = MarkerService.Default;
