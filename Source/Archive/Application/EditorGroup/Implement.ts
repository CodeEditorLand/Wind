/**
 * @module Implement
 * @description
 * This module provides the "live" implementation `Layer` for the `EditorGroupService`.
 */

import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { IStorageService } from "@codeeditorland/output/vs/platform/storage/common/storage.js";
import { Layer } from "effect";

import { InstantiationService } from "../Instantiation/Define.js";
import { StorageService } from "../Storage/Define.js";
import { EditorGroupService } from "./Define.js";

/**
 * The live implementation `Layer` for the `EditorGroupService`.
 *
 * This layer is derived directly from the default implementation provided
 * in the service definition. It automatically includes the dependencies
 * required by its `effect` constructor, such as the `IInstantiationService`
 * and `IStorageService`.
 */
export const ProvideEditorGroup = EditorGroupService.Default as Layer.Layer<
	EditorGroupService,
	never,
	IInstantiationService | IStorageService
>;
