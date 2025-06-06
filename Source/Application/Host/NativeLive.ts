import { Layer } from "effect";

import Definition from "./NativeDefinition.js";
import ServiceTag from "./NativeTag.js";

const LiveNativeHostService: Layer.Layer<
	import("./NativeTag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveNativeHostService;
