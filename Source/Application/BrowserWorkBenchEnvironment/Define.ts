/**
 * @module Define
 * @description
 * Defines the service for providing environment-specific information to the
 * workbench. This implementation lifts the `BrowserWorkbenchEnvironmentService`
 * from VS Code and populates it with data from our `HostService`.
 */

import { URI } from "@codeeditorland/output/vs/base/common/uri.js";
import { IProductService } from "@codeeditorland/output/vs/platform/product/common/productService.js";
import {
	IBrowserWorkbenchEnvironmentService,
	BrowserWorkbenchEnvironmentService as VSCodeBrowserWorkbenchEnvironmentService,
} from "@codeeditorland/output/vs/workbench/services/environment/browser/environmentService.js";
import { Effect } from "effect";

import { HostService } from "../Host/Define.js";

/**
 * The `Effect.Service` for the `IBrowserWorkbenchEnvironmentService`.
 *
 * This service implementation "lifts" the original `BrowserWorkbenchEnvironmentService`
 * class from VS Code. It is responsible for providing detailed information about the
 * runtime environment, such as remote authority, log paths, and extension development
 * settings.
 *
 * The service is constructed by taking the `ISandboxConfiguration` provided by our
 * `HostService` and passing it as the `IWorkbenchConstructionOptions` that the
 * VS Code service expects.
 *
 * It is registered with the identifier "environmentService" for compatibility.
 */
export class BrowserWorkbenchEnvironmentService extends Effect.Service<IBrowserWorkbenchEnvironmentService>()(
	"environmentService",
	{
		effect: Effect.gen(function* (Generator) {
			const Host = yield* Generator(HostService);
			const ProductService = yield* Generator(IProductService);

			const Configuration = Host.Configuration;

			const ServiceInstance =
				new VSCodeBrowserWorkbenchEnvironmentService(
					Configuration.workspace.id,
					URI.revive(Configuration.logsPath),
					Configuration,
					ProductService,
				);

			return ServiceInstance;
		}),
	},
) {}
