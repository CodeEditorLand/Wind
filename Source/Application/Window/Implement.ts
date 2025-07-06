/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `WindowService`.
 */

import { Layer } from "effect";

import { HostService } from "../Host/Define.js";
import { WorkSpaceService } from "../WorkSpace/Define.js";
import { WindowService } from "./Define.js";

/**
 * The live implementation `Layer` for the `WindowService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as the `HostService` and `WorkSpaceService`.
 */
export const ProvideWindow = WindowService.Default as Layer.Layer<
	WindowService,
	never,
	HostService | WorkSpaceService
>;
