/*
 * File: Wind/Source/Application/EditorGroups/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:42 UTC
 * Dependency: ../Storage.js, ./Definition.js, ./Tag.js, effect
 */

import { Layer } from "effect";

import {
	InstantiationServiceTag,
	LiveInstantiationService,
} from "../Instantiation.js";
import { LiveStorageService, StorageServiceTag } from "../Storage.js";
import Definition from "./Definition.js";
import ServiceTag from "./Tag.js";

// This service requires other services to be initialized. We create a combined layer.
const DependenciesLayer = Layer.merge(
	LiveStorageService,
	LiveInstantiationService,
);

const LiveEditorGroupsService: Layer.Layer<
	import("./Tag.js").Interface,
	any,
	any
> = Layer.effect(ServiceTag, Definition).pipe(Layer.provide(DependenciesLayer));

export default LiveEditorGroupsService;
