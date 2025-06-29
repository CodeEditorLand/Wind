/**
 * @module Live (Application/Command)
 * @description Provides the "live" implementation `Layer` for the Command service.
 */
import { Layer } from "effect";
import { IPCService } from "../IPC/Service.js";
import { LoggerService } from "../Logger/Service.js";
import { WindowService } from "../Window/Service.js";
import { CommandService } from "./Service.js";
/**
 * The live implementation `Layer` for the `CommandService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes any dependencies
 * required by its `effect` constructor, such as the `IPCService`, `LoggerService`,
 * and `WindowService`.
 */
export declare const CommandLive: Layer.Layer<CommandService, never, IPCService | LoggerService | WindowService>;
