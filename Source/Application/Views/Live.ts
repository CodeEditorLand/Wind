import { Layer } from "effect";

import Definition from "./Definition.js";
import ServiceTag from "./Tag.js";

const LiveViewDescriptorService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.effect(ServiceTag, Definition);

export default LiveViewDescriptorService;
