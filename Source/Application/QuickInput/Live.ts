import { Layer } from "effect";

import Definition from "./Definition.js";
import ServiceTag from "./Tag.js";

const LiveQuickInputService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveQuickInputService;
