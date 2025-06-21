/**
 * @module Live (EditorGroups/Application)
 * @description Provides the "live" implementation of the IEditorGroupsService as a Layer.
 */
import { Layer } from "effect";

import { InstantiationService } from "../Instantiation/mod.js";
import { StorageService } from "../Storage/mod.js";
import { Definition } from "./Definition.js";
import { Tag } from "./Service.js";

// Assuming an Error module exists for this service
// import type { EditorGroupsProblem } from "./Error.js";

/**
 * The live implementation Layer for the EditorGroups service.
 *
 * It uses `Layer.effect` to construct the service instance from its definition.
 *
 * This Layer has context requirements: it needs the `InstantiationService` and
 * `StorageService` to be available in the layer provided to it. The master
 * `AppLayer` is responsible for providing these dependencies.
 */
const Live: Layer.Layer<
	import("./Service.js").Interface,
	never, // This layer itself introduces no new errors
	InstantiationService.Interface | StorageService.Interface
> = Layer.effect(Tag, Definition);

export default Live;
