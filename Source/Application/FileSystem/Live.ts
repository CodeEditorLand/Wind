/**
 * @module Live (Application/FileSystem)
 * @description Provides the "live" implementation `Layer` for the FileSystemProvider service.
 */

import { Layer } from "effect";
import { FileSystemProviderService } from "./Service.js";

/**
 * The live implementation `Layer` for the `FileSystemProviderService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes any dependencies
 * required by its `effect` constructor, such as the `IntegrationService`.
 */
export const FileSystemProviderLive: Layer.Layer<FileSystemProviderService> =
	FileSystemProviderService.Default;
