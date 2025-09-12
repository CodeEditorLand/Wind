/**
 * @module Live (Application/TreeView)
 * @description Provides the "live" implementation `Layer` for the TreeView service.
 */
import { Layer } from "effect";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IViewsService } from "@codeeditorland/output/vs/workbench/common/views.js";
import { TreeViewService } from "./Service.js";
/**
 * The live implementation `Layer` for the `TreeViewService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `TreeViewService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as `IViewsService`
 * and `ILogService`.
 */
export declare const TreeViewLive: Layer.Layer<TreeViewService, never, IViewsService | ILogService>;
//# sourceMappingURL=Live.d.ts.map