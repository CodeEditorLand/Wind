/**
 * @module Live (Application/Host)
 * @description Provides the "live" implementation `Layer` for the Host service.
 */
import { Layer } from "effect";
import type { IntegrationService } from "Source/Integration/Tauri/Service.js";
import { HostService } from "./Service.js";
/**
 * The live implementation `Layer` for the `HostService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `HostService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as the
 * `IntegrationService`.
 */
export declare const HostLive: Layer.Layer<HostService, never, IntegrationService>;
