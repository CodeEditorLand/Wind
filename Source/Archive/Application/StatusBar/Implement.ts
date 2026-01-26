/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `StatusBarService`.
 */

import { Layer } from "effect";

import { CommandService } from "../Command/Define.js";
import { HostService } from "../Host/Define.js";
import { StatusBarService } from "./Define.js";

/**
 * The live implementation `Layer` for the `StatusBarService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as the `HostService` and `CommandService`.
 */
export const ProvideStatusBar = StatusBarService.Default as Layer.Layer<
	StatusBarService,
	never,
	HostService | CommandService
>;
