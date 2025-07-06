/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `TreeViewService`.
 */

import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IViewsService } from "@codeeditorland/output/vs/workbench/common/views.js";
import { Layer } from "effect";

import { LoggerService } from "../Logger/Define.js";
import { ViewsService as ViewsServicePlaceholder } from "../Views/Define.js";
import { TreeViewService } from "./Define.js";

/**
 * The live implementation `Layer` for the `TreeViewService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes the dependencies
 * required by its `effect` constructor, such as `IViewsService` and `ILogService`.
 */
export const ProvideTreeView = TreeViewService.Default as Layer.Layer<
	TreeViewService,
	never,
	IViewsService | ILogService
>;
