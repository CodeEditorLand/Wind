import { Layer } from "effect";

import Definition from "./Definition.js";
import { CommandRegistryRef } from "./Ref.js";
import type { CommandEffect } from "./Register.js";
import ServiceTag from "./Tag.js";

const LiveCommandService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.effect(ServiceTag, Definition).pipe(
	Layer.provide(
		Layer.succeed(
			CommandRegistryRef,
			new Map<string, CommandEffect<any, any>>(),
		),
	),
);

export default LiveCommandService;
