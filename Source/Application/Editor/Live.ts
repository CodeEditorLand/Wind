/**
 * @module Live (Editor/Application)
 * @description Provides the "live" implementation of the IEditorService as a Layer.
 */
import { Layer } from "effect";

import { EditorGroupsService } from "../EditorGroups/mod.js";
import { InstantiationService } from "../Instantiation/mod.js";
import { TextEditorService } from "../TextEditor/mod.js";
import { Definition } from "./Definition.js";
import type { EditorProblem } from "./Error.js";
import { Tag } from "./Service.js";

/**
 * The live implementation Layer for the Editor service.
 *
 * It uses `Layer.effect` to construct the service instance from its definition.
 *
 * This Layer has context requirements: it needs the `InstantiationService`,
 * `EditorGroupsService`, and `TextEditorService` to be available in the layer
 * provided to it. The master `AppLayer` is responsible for providing these
 * dependencies.
 */
const Live: Layer.Layer<
	import("./Service.js").Interface,
	EditorProblem,
	| InstantiationService.Interface
	| EditorGroupsService.Interface
	| TextEditorService.Interface
> = Layer.effect(Tag, Definition);

export default Live;
