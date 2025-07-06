/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `HostService`.
 */

import { Layer } from "effect";

import { IntegrationService } from "../Integration/Define.js";
import { HostService } from "./Define.js";

/**
 * The live implementation `Layer` for the `HostService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `HostService` definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as the
 * `IntegrationService`.
 */
export const ProvideHost = HostService.Default as Layer.Layer<
	HostService,
	never,
	IntegrationService
>;
