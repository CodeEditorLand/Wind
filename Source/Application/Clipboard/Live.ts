import { Layer } from "effect";
import ServiceTag from "./Tag.js";
import Definition from "./Definition.js";

const LiveClipboardService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveClipboardService;

import { Layer } from "effect";
import ServiceTag from "./Tag.js";
import Definition from "./Definition.js";

const LiveClipboardService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveClipboardService;
