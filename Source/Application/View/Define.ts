/**
 * @module Define
 * @description
 * Defines a placeholder for the `IViewsService`. This stub is necessary to
 * satisfy the dependency requirements of the `TreeViewService` and will be
 * fully implemented in a later step.
 */

import type { IViewsService } from "@codeeditorland/output/vs/workbench/common/views.js";
import { Effect } from "effect";

export class ViewService extends Effect.Service<IViewsService>()(
	"viewsService",
	{
		sync: () =>
			({
				registerTreeDataProvider: () => ({ dispose: () => {} }),
			}) as any,
	},
) {}
