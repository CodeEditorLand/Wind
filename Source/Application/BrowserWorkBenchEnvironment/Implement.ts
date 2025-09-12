/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the
 * `BrowserWorkbenchEnvironmentService`.
 */

import { IProductService } from "@codeeditorland/output/vs/platform/product/common/productService.js";
import { Layer } from "effect";

import { HostService } from "../Host/Define.js";
import { ProductService } from "../Product/Define.js";
import { BrowserWorkbenchEnvironmentService } from "./Define.js";

/**
 * The live implementation `Layer` for the `BrowserWorkbenchEnvironmentService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * which are the `HostService` (to get the initial sandbox configuration) and
 * the `IProductService`.
 */
export const ProvideBrowserWorkbenchEnvironment =
	BrowserWorkbenchEnvironmentService.Default as Layer.Layer<
		BrowserWorkbenchEnvironmentService,
		never,
		HostService | IProductService
	>;
