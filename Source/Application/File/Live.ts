/**
 * @module Live (Application/File)
 * @description Provides the "live" implementation `Layer` for the File service.
 */

import { Layer } from "effect";
import { FileService } from "./Service.js";

/**
 * The live implementation `Layer` for the `FileService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the `FileService` service definition. It automatically includes the
 * dependencies required by its `effect` constructor, such as `ILogService` and
 * `FileSystemProviderService`.
 */
export const FileLive: Layer.Layer<FileService> = FileService.Default;
