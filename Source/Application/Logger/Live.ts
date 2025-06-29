/**
 * @module Live (Application/Logger)
 * @description Provides the "live" implementation `Layer` for the Logger service.
 */

import { Layer } from "effect";

import { LoggerService } from "./Service.js";

/**
 * The live implementation `Layer` for the `LoggerService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `LoggerService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as the `HostService`.
 */
export const LoggerLive: Layer.Layer<LoggerService> = LoggerService.Default;
