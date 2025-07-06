/**
 * @module Implement
 * @description
 * Provides the "live" implementation `Layer` for the `LanguageFeatureService`.
 */

import { Layer } from "effect";

import { LanguageFeatureService } from "./Define.js";

/**
 * The live implementation `Layer` for the `LanguageFeatureService`.
 *
 * This layer is derived directly from the default (`sync`) implementation provided
 * in the `LanguageFeatureService` definition. Because the current
 * implementation is a stub, it has no dependencies.
 */
export const ProvideLanguageFeature =
	LanguageFeatureService.Default as Layer.Layer<LanguageFeatureService>;
