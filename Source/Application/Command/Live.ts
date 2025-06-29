/**
 * @module Live (Application/Command)
 * @description Provides the "live" implementation `Layer` for the Command service.
 */

import { Layer } from "effect";

import { CommandService } from "./Service.js";

/**
 * The live implementation `Layer` for the `CommandService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes any dependencies
 * required by its `effect` constructor, such as the `IPCService`, `LoggerService`,
 * and `WindowService`.
 */
export const CommandLive: Layer.Layer<CommandService> = CommandService.Default;
