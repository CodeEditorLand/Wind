/**
 * @module Effect/Sidebar/Tag/SidebarTag
 * @description
 * Service tag for Sidebar dependency injection.
 * Provides the Context.Tag for accessing Sidebar service in Effect programs.
 * @see {@link Effect/Sidebar/Interface/SidebarService} Service interface
 * @see {@link Effect/Sidebar/Layer/SidebarLive} Live implementation
 * @category Tag
 */

import { Context } from "effect";

import type { SidebarService } from "../Interface/SidebarService.js";

/**
 * Context.Tag for Sidebar service dependency injection.
 * Use this tag to access Sidebar in Effect programs.
 *
 * @example
 * ```ts
 * import { Effect } from "effect";
 * import { SidebarTag } from "./Effect/Sidebar/Tag/SidebarTag.js";
 *
 * const createPanel = Effect.gen(function* () {
 *   const sidebar = yield* SidebarTag;
 *   return yield* sidebar.createPanel({ title: "Explorer", icon: "files", position: "left", priority: 1, viewId: "explorer", collapsed: false });
 * });
 * ```
 */
export default class SidebarTag extends Context.Tag("Sidebar")<
	SidebarTag,

	SidebarService
>() {}

/**
 * Alias for SidebarTag for shorter import paths.
 */
export const Sidebar = SidebarTag;
