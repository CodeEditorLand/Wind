/**
 * @module Effect/Configuration/Tag/ConfigurationTag
 * @description
 * Context Tag for Configuration service dependency injection.
 * Enables service composition and layering in Effect programs.
 * @see {@link Effect/Configuration/Interface/ConfigurationService} Service interface
 * @see [Effect-TS Context](https://effect.website/docs/guide/context)
 * @category Tag
 */

import { Context } from "effect";

import type { ConfigurationService } from "../Interface/ConfigurationService.js";

// ============================================================================
// Service Tag
// ============================================================================

/**
 * Context Tag for Configuration service.
 * Use this to inject the Configuration service into Effect programs.
 *
 * @example
 * ```ts
 * import { ConfigurationTag } from "./Tag/ConfigurationTag.js";
 *
 * const effect = Effect.gen(function* () {
 *   const configuration = yield* ConfigurationTag;
 *   const config = yield* configuration.get;
 *   return config;
 * });
 * ```
 */
export class ConfigurationTag extends Context.Tag("Configuration")<ConfigurationTag, ConfigurationService>() {}

export default ConfigurationTag;
