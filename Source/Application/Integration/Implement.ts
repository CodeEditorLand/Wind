/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `IntegrationService`.
 */

import { Layer } from "effect";

import { IntegrationService } from "./Define.js";

/**
 * The live implementation `Layer` for the `IntegrationService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `IntegrationService` definition. Because the implementation is defined
 * within the service itself, this layer is very simple and has no dependencies
 * that need to be explicitly provided here.
 */
export const ProvideIntegration =
	IntegrationService.Default as Layer.Layer<IntegrationService>;
