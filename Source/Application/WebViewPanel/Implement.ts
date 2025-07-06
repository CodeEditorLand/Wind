/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `WebViewPanelService`.
 */

import { Layer } from "effect";

import { HostService } from "../Host/Define.js";
import { IPCService } from "../IPC/Define.js";
import { WebViewPanelService } from "./Define.js";

/**
 * The live implementation `Layer` for the `WebViewPanelService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes any dependencies
 * required by its `effect` constructor, such as the `IPCService` and `HostService`.
 */
export const ProvideWebViewPanel = WebViewPanelService.Default as Layer.Layer<
	WebViewPanelService,
	never,
	IPCService | HostService
>;
