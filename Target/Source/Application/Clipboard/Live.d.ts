/**
 * @module Live (Application/Clipboard)
 * @description Provides the "live" implementation `Layer` for the Clipboard service.
 * This layer is responsible for constructing the live `Clipboard` service instance.
 */
import { Layer } from "effect";

import { Clipboard } from "./Service.js";

/**
 * The live implementation `Layer` for the `Clipboard` service.
 *
 * This layer is derived directly from the default implementation provided
 * in the `Clipboard` service definition. It is self-contained and has no
 * external service dependencies, as its definition encapsulates all necessary logic.
 */
export declare const ClipboardLive: Layer.Layer<Clipboard>;
