/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `CommandService`.
 * It constructs the service and declares its dependencies.
 */

import { Layer } from "effect";

import { IPCService } from "../IPC/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { WindowService } from "../Window/Define.js";
import { CommandService } from "./Define.js";

/**
 * The live implementation `Layer` for the `CommandService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes any dependencies
 * required by its `effect` constructor, such as the `IPCService`,
 * `LoggerService`, and `WindowService`.
 */
export const ProvideCommand = CommandService.Default as Layer.Layer<
	CommandService,
	never,
	IPCService | LoggerService | WindowService
>;
