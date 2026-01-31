/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `IPCService`.
 */

import { Layer } from "effect";

import { CancellationService } from "../Cancellation/Define.js";
import { IPCConfigurationService } from "../IPCConfiguration/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { IPCService } from "./Define.js";

/**
 * The live implementation `Layer` for the `IPCService`.
 *
 * It is derived from the default implementation in the service definition.
 * Because `IPCService` is scoped, this layer must also be scoped. It
 * depends on other core services to function correctly.
 */
export const ProvideIPC = IPCService.Default as Layer.Layer<
	IPCService,
	never,
	IPCConfigurationService | CancellationService | LoggerService
>;
