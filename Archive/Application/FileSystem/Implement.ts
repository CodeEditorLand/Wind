/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `FileSystemService`.
 */

import { Layer } from "effect";

import { HostService } from "../Host/Define.js";
import { FileSystemService } from "./Define.js";

/**
 * The live implementation `Layer` for the `FileSystemService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes any dependencies
 * required by its `effect` constructor, such as the `HostService`.
 */
export const ProvideFileSystem = FileSystemService.Default as Layer.Layer<
	FileSystemService,
	never,
	HostService
>;
