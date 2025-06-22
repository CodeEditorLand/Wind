/**
 * @module Live (TextEditor/Application)
 * @description Provides the "live" implementation of the ITextEditorService as a Layer.
 */
import { Layer } from "effect";

import { Definition } from "./Definition.js";
import { Tag } from "./Service.js";

/**
 * The live implementation Layer for the TextEditor service.
 *
 * It has context requirements for the services needed by its definition.
 */
const Live: Layer.Layer<
	import("./Service.js").Interface,
	never,
	// | UntitledTextEditorService.Interface
	Instantiation.Interface | File.Interface
> = Layer.effect(Tag, Definition);

export default Live;
