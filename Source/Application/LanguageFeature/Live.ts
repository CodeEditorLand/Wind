/**
 * @module Live (Application/LanguageFeature)
 * @description Provides the "live" implementation `Layer` for the LanguageFeature service.
 */

import { Layer } from "effect";
import { LanguageFeatureService } from "./Service.js";

/**
 * The live implementation `Layer` for the `LanguageFeatureService`.
 *
 * This layer is derived directly from the default (`sync`) implementation provided
 * in the `LanguageFeatureService` service definition. Because the current
 * implementation is a stub, it has no dependencies.
 */
export const LanguageFeatureLive: Layer.Layer<LanguageFeatureService> =
	LanguageFeatureService.Default;
