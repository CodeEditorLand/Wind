/**
 * @module Live (Application/Log)
 * @description Provides the "live" implementation `Layer` for the Log service.
 */
import { Layer } from "effect";
import { LogService } from "./Service.js";
/**
 * The live implementation `Layer` for the `LogService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `LogService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as the `HostService`.
 */
export declare const LogLive: Layer.Layer<LogService>;
