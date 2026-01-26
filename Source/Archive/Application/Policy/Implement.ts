/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `PolicyService`.
 */

import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { IBrowserWorkbenchEnvironmentService } from "@codeeditorland/output/vs/workbench/services/environment/browser/environmentService.js";
import { Layer } from "effect";

import { BrowserWorkbenchEnvironmentService } from "../BrowserWorkbenchEnvironment/Define.js";
import { FileService } from "../File/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { PolicyService } from "./Define.js";

/**
 * The live implementation `Layer` for the `PolicyService`.
 *
 * It automatically includes dependencies required by its `effect` constructor,
 * such as the `IBrowserWorkbenchEnvironmentService`, `IFileService`, and `ILogService`.
 */
export const ProvidePolicy = PolicyService.Default as Layer.Layer<
	PolicyService,
	never,
	IBrowserWorkbenchEnvironmentService | IFileService | ILogService
>;
