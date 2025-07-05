/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `DialogService`.
 * It constructs the service and declares its dependency on the `HostService`.
 */

import { Layer } from "effect";

import { HostService } from "../Host/Define.js";
import { DialogService } from "./Define.js";

/**
 * The live implementation `Layer` for the `DialogService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `DialogService` definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as the `HostService`.
 */
export const ProvideDialog = DialogService.Default as Layer.Layer<
	DialogService,
	never,
	HostService
>;
