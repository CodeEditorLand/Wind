/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `MarkerService`.
 */

import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { Layer } from "effect";

import { IntegrationService } from "../Integration/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { MarkerService } from "./Define.js";

/**
 * The live implementation `Layer` for the `MarkerService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as the `ILogService` and `IntegrationService`.
 */
export const ProvideMarker = MarkerService.Default as Layer.Layer<
	MarkerService,
	never,
	ILogService | IntegrationService
>;
