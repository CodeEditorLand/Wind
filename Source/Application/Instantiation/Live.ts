import { Layer } from "effect";
import ServiceTag from "./Tag.js";
import { InstantiationService } from "vs/platform/instantiation/common/instantiationService.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";

// A mock instantiation service that can create instances but has no services by default.
// In a real scenario, this would be the main application instantiation service.
const LiveInstantiationService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.succeed(
	ServiceTag,
	new InstantiationService(new ServiceCollection()),
);

export default LiveInstantiationService;

import { Layer, Effect, Runtime } from "effect";
import ServiceTag from "./Tag.js";
import CreateDefinition from "./Definition.js";

// This is the master layer for the entire application.
// In a real scenario, this would compose all other Live*Service layers.
const AppLayer = Layer.empty; // Example: Layer.merge(LiveStorageService, LiveFileService)

const LiveInstantiationService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	any
> = Layer.effect(
	ServiceTag,
	Effect.gen(function* (_) {
		const AppRuntime = yield* _(Effect.runtime<any>());
		const Service = yield* _(CreateDefinition(AppRuntime));
		return Service;
	}),
).pipe(Layer.provide(AppLayer));

export default LiveInstantiationService;

import { Layer, Effect } from "effect";
import ServiceTag from "./Tag.js";
import CreateDefinition from "./Definition.js";
import { AppLayer } from "./Layer.js";

const LiveInstantiationService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	any
> = Layer.effect(
	ServiceTag,
	Effect.flatMap(Effect.runtime<any>(), (AppRuntime) =>
		CreateDefinition(AppRuntime),
	),
).pipe(Layer.provide(AppLayer));

export default LiveInstantiationService;
