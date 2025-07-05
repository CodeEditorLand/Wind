/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `StorageService`.
 */

import { Layer } from "effect";

import { IntegrationService } from "../Integration/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { StorageService } from "./Define.js";

/**
 * The live implementation `Layer` for the `StorageService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as `IntegrationService` and `LoggerService`.
 */
export const ProvideStorage = StorageService.Default as Layer.Layer<
	StorageService,
	never,
	IntegrationService | LoggerService
>;
