/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `UriIdentityService`.
 */

import { IFileService } from "@codeeditorland/output/vs/platform/files/common/files.js";
import { Layer } from "effect";

import { FileService } from "../File/Define.js";
import { URIIdentityService } from "./Define.js";

/**
 * The live implementation `Layer` for the `UriIdentityService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes the dependencies
 * required by its `effect` constructor, which is the `IFileService`.
 */
export const ProvideURIIdentity = URIIdentityService.Default as Layer.Layer<
	URIIdentityService,
	never,
	IFileService
>;
