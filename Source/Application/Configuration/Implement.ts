/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `ConfigurationService`.
 * This layer is responsible for constructing the live service instance that
 * reads and provides application settings.
 */

import { Layer } from "effect";

import { IntegrationService } from "../Integration/Define.js";
import { ConfigurationService } from "./Define.js";

/**
 * The live implementation `Layer` for the `ConfigurationService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes any dependencies
 * required by its `effect` constructor, such as the `IntegrationService`
 * needed for path resolution and file reading.
 */
export const ProvideConfiguration = ConfigurationService.Default as Layer.Layer<
	ConfigurationService,
	never,
	IntegrationService
>;
