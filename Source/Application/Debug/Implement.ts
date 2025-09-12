/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `DebugService`.
 */

import { Layer } from "effect";

import { IPCService } from "../IPC/Define.js";
import { DebugService } from "./Define.js";

/**
 * The live implementation `Layer` for the `DebugService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as the `IPCService`.
 */
export const ProvideDebug = DebugService.Default as Layer.Layer<
	DebugService,
	never,
	IPCService
>;
