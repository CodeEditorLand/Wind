/**
 * @module Live (Application/StatusBar)
 * @description Provides the "live" implementation `Layer` for the StatusBar service.
 */
import { Layer } from "effect";

import { CommandService } from "../Command/Service.js";
import { HostService } from "../Host/Service.js";
import { StatusBarService } from "./Service.js";

/**
 * The live implementation `Layer` for the `StatusBarService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as the `HostService` and `CommandService`.
 */
export declare const StatusBarLive: Layer.Layer<
	StatusBarService,
	never,
	HostService | CommandService
>;
