import { Layer } from "effect";
import ServiceTag from "./Tag.js";
import Definition from "./Definition.js";

const LiveWorkspacesService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveWorkspacesService;

import { Layer } from "effect";
import ServiceTag from "./Tag.js";
import Definition from "./Definition.js";

const LiveWorkspacesService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveWorkspacesService;
