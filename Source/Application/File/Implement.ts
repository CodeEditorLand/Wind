/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `FileService`.
 */

import { ILogService } from "@codeeditorland/output/vs/platform/log/common/log.js";
import { Layer } from "effect";

import { FileSystemService } from "../FileSystem/Define.js";
import { FileService } from "./Define.js";

/**
 * The live implementation `Layer` for the `FileService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `FileService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, which are the
 * `ILogService` and our `FileSystemService`.
 */
export const ProvideFile = FileService.Default as Layer.Layer<
	FileService,
	never,
	ILogService | FileSystemService
>;
