import { Layer } from "effect";

import Definition from "./Definition.js";
import ServiceTag from "./Tag.js";

const LiveConfigurationService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	| import("../../../Integration/Tauri.js").PathProblem
	| import("../../../Integration/Configuration.js").JsonParseProblem
	| import("../../../Integration/Configuration.js").FileSystemProblem
> = Layer.effect(ServiceTag, Definition);

export default LiveConfigurationService;
