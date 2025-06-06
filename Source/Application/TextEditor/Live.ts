import { Layer } from "effect";
import { TextEditorService } from "vs/workbench/services/textfile/common/textEditorService.js";

import { FileServiceTag, LiveFileService } from "../File.js"; // Assuming a File module exists
import {
	InstantiationServiceTag,
	LiveInstantiationService,
} from "../Instantiation.js";
import ServiceTag from "./Tag.js";

// This service has dependencies, so we create a layer for them.
const DependenciesLayer = Layer.merge(
	LiveFileService,
	LiveInstantiationService,
);

const LiveTextEditorService: Layer.Layer<
	import("./Tag.js").Interface,
	any,
	any
> = Layer.effect(
	ServiceTag,
	Effect.map(
		Effect.all([InstantiationServiceTag, FileServiceTag]),
		([instantiationService, fileService]) => {
			// The original service has more dependencies that would need to be provided here.
			return instantiationService.createInstance(
				TextEditorService,
				fileService,
				{} as any,
				instantiationService,
				{} as any,
				{} as any,
				{} as any,
			);
		},
	),
).pipe(Layer.provide(DependenciesLayer));

export default LiveTextEditorService;
