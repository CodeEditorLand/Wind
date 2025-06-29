/**
 * @module Live (Application/Debug)
 * @description Provides the "live" implementation `Layer` for the Debug service.
 */

import { Layer } from "effect";

import { DebugService } from "./Service.js";

/**
 * The live implementation `Layer` for the `DebugService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as the `IPCService`.
 */
export const DebugLive: Layer.Layer<DebugService> = DebugService.Default;
