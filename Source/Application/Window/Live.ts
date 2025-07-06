/**
 * @module Live (Application/Window)
 * @description Provides the "live" implementation `Layer` for the Window service.
 */

import { Layer } from "effect";

import { HostService } from "../Host/Service.js";
import { WorkSpaceService } from "../WorkSpace/Define.js";
import { WindowService } from "./Service.js";

/**
 * The live implementation `Layer` for the `WindowService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as the `HostService` and `WorkSpaceService`.
 */
export const WindowLive: Layer.Layer<
	WindowService,
	never,
	HostService | WorkSpaceService
> = WindowService.Default;
