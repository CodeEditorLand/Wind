/**
 * @module Live (Application/Storage)
 * @description Provides the "live" implementation `Layer` for the Storage service.
 */

import { Layer } from "effect";
import { ILogService } from "vs/platform/log/common/log.js";
import { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { StorageService } from "./Service.js";

/**
 * The live implementation `Layer` for the `StorageService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as `IntegrationService` and `ILogService`.
 */
export const StorageLive: Layer.Layer<
	StorageService,
	never,
	IntegrationService | ILogService
> = StorageService.Default;
