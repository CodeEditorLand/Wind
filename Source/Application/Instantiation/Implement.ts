/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `InstantiationService`.
 */

import { Layer } from "effect";

import { InstantiationService } from "./Define.js";

/**
 * The live implementation `Layer` for the `InstantiationService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. A more complete implementation would gather
 * services from the Effect context and populate the `ServiceCollection`.
 */
export const ProvideInstantiation = InstantiationService.Default as Layer.Layer<
	InstantiationService,
	never,
	never
>;
