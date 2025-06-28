/**
 * @module Live (Application/WebViewPanel)
 * @description Provides the "live" implementation `Layer` for the WebViewPanel service.
 */
import { Layer } from "effect";
import { WebViewPanelService } from "./Service.js";
/**
 * The live implementation `Layer` for the `WebViewPanelService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes any dependencies
 * required by its `effect` constructor.
 */
export declare const WebViewPanelLive: Layer.Layer<WebViewPanelService>;
