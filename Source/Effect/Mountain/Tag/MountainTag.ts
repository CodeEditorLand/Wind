/**
 * @module Effect/Mountain/Tag/MountainTag
 * @description
 * Context Tag for Mountain service dependency injection.
 * Enables service composition and layering in Effect programs.
 * @see {@link Effect/Mountain/Interface/MountainService} Service interface
 * @see [Effect-TS Context](https://effect.website/docs/guide/context)
 * @category Tag
 */

import { Context } from "effect";

import type { MountainService } from "../Interface/MountainService.js";

// ============================================================================
// Service Tag
// ============================================================================

/**
 * Context Tag for Mountain service.
 * Use this to inject the Mountain service into Effect programs.
 *
 * @example
 * ```ts
 * import { MountainTag } from "./Tag/MountainTag.js";
 *
 * const effect = Effect.gen(function* () {
 *   const mountain = yield* MountainTag;
 *   const version = yield* mountain.version;
 *   return version;
 * });
 * ```
 */
export class MountainTag extends Context.Tag("Mountain")<
	MountainTag,
	MountainService
>() {}

export default MountainTag;
