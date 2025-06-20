

/**
 * @module Live (Dialog/Application)
 * @description Provides the "live" implementation of the IFileDialogService as a Layer.
 */
import { Layer } from "effect";

import { ConfigurationService } from "../Configuration/mod.js";
import { Definition } from "./Definition.js";
import type { DialogProblem } from "./Error/mod.js";
import { Tag } from "./Service.js";

/**
 * The live implementation Layer for the Dialog service.
 *
 * It uses `Layer.effect` to construct the service instance from its definition.
 *
 * This Layer has a context requirement: it needs a `ConfigurationService` to be
 * available in the layer provided to it. The master `AppLayer` is responsible
 * for providing this dependency.
 */
const Live: Layer.Layer<
	import("./Service.js").Interface,
	DialogProblem,
	ConfigurationService.Interface
> = Layer.effect(Tag, Definition);

export default Live;
