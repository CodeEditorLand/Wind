/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `QuickInputService`.
 */

import { Layer } from "effect";

import { HostService } from "../Host/Define.js";
import { QuickInputService } from "./Define.js";

/**
 * The live implementation `Layer` for the `QuickInputService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes the dependencies
 * required by its `effect` constructor, such as the `HostService`.
 */
export const ProvideQuickInput = QuickInputService.Default as Layer.Layer<
	QuickInputService,
	never,
	HostService
>;
