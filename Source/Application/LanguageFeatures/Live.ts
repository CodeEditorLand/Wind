/**
 * @module Live (Application/LanguageFeatures)
 * @description Provides the "live" implementation `Layer` for the LanguageFeatures service.
 */

import { Layer } from "effect";
import { LanguageFeaturesService } from "./Service.js";

/**
 * The live implementation `Layer` for the `LanguageFeaturesService`.
 *
 * This layer is derived directly from the default (`sync`) implementation provided
 * in the `LanguageFeaturesService` service definition. Because the current
 * implementation is a stub, it has no dependencies.
 */
export const LanguageFeaturesLive: Layer.Layer<LanguageFeaturesService> =
	LanguageFeaturesService.Default;
