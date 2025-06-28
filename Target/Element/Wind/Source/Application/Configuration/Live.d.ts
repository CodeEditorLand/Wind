/**
 * @module Live (Application/Configuration)
 * @description Provides the "live" implementation `Layer` for the Configuration service.
 */
import { Layer } from "effect";
import { Configuration } from "./Service.js";
/**
 * The live implementation `Layer` for the `Configuration` service.
 *
 * This layer is derived directly from the default implementation provided
 * in the `Configuration` service definition (`Configuration.Default`).
 * All dependencies required by the service's `effect` constructor (such as
 * integration services for path resolution and file reading) are automatically
 * inferred and added to this layer's context requirements.
 */
export declare const ConfigurationLive: Layer.Layer<Configuration>;
