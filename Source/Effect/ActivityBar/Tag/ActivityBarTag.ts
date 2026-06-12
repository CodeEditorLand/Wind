/**
 * @module Effect/ActivityBar/Tag/ActivityBarTag
 * @description
 * Context Tag for ActivityBar service dependency injection.
 * Enables service composition and layering in Effect programs.
 * @see {@link Effect/ActivityBar/Interface/ActivityBarService} Service interface
 * @see [Effect-TS Context](https://effect.website/docs/guide/context)
 * @category Tag
 */

import { Context } from "effect";

import type { ActivityBarService } from "../Interface/ActivityBarService.js";

// ============================================================================
// Service Tag
// ============================================================================

/**
 * Context Tag for ActivityBar service.
 * Use this to inject the ActivityBar service into Effect programs.
 *
 * @example
 * ```ts
 * import { ActivityBarTag } from "./Tag/ActivityBarTag.js";
 *
 * const effect = Effect.gen(function* () {
 *   const activityBar = yield* ActivityBarTag;
 *   const items = yield* activityBar.items;
 * });
 * ```
 */
export class ActivityBarTag extends Context.Tag("ActivityBar")<
	ActivityBarTag,

	ActivityBarService
>() {}

export default ActivityBarTag;
