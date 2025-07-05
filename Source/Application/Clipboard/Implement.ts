/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `ClipboardService`.
 * This layer is responsible for constructing the live service instance that
 * interacts with the native system clipboard.
 */

import { Layer } from "effect";

import { IntegrationService } from "../Integration/Define.js";
import { ClipboardService } from "./Define.js";

/**
 * The live implementation `Layer` for the `ClipboardService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `ClipboardService` definition. It automatically includes any dependencies
 * required by its `effect` constructor, which in this case is the
 * `IntegrationService`.
 */
export const ProvideClipboard = ClipboardService.Default as Layer.Layer<
	ClipboardService,
	never,
	IntegrationService
>;
