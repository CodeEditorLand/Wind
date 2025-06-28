/**
 * @module Live (Application/FileSystem)
 * @description Provides the "live" implementation `Layer` for the FileSystem service.
 */

import { Layer } from "effect";
import { FileSystemService } from "./Service.js";

/**
 * The live implementation `Layer` for the `FileSystemService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes any dependencies
 * required by its `effect` constructor, such as the `HostService`.
 */
export const FileSystemLive: Layer.Layer<FileSystemService> =
	FileSystemService.Default;
