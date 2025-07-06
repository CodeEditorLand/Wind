/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `LoggerService`.
 */

import { Layer } from "effect";

import { HostService } from "../Host/Define.js";
import { LoggerService } from "./Define.js";

/**
 * The live implementation `Layer` for the `LoggerService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `LoggerService` definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as the `HostService`.
 */
export const ProvideLogger = LoggerService.Default as Layer.Layer<
	LoggerService,
	never,
	HostService
>;
