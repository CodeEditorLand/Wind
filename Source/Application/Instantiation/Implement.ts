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
 * in the service definition. It is a simple layer because the complex logic
 * of gathering services from the context is handled within the service's
 * `effect` constructor itself.
 */
export const ProvideInstantiation = InstantiationService.Default as Layer.Layer<
	InstantiationService,
	never,
	never // Dependencies are implicitly gathered from the context.
>;
