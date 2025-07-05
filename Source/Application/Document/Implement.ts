/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `DocumentService`.
 * It constructs the service and declares its dependencies on core infrastructure
 * services like `IPCService` and `LoggerService`.
 */

import { Layer } from "effect";

import { IPCService } from "../IPC/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { DocumentService } from "./Define.js";

/**
 * The live implementation `Layer` for the `DocumentService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes the dependencies
 * required by its `effect` constructor, such as `IPCService` and `LoggerService`.
 */
export const ProvideDocument = DocumentService.Default as Layer.Layer<
	DocumentService,
	never,
	IPCService | LoggerService
>;
