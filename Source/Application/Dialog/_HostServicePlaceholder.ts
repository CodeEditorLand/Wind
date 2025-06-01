// Application/Dialog/_HostServicePlaceholder.ts
import { Layer, type Context } from "effect";

import { HostServiceTag } from "../../Platform/VSCode/Provide.js";
import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../../Platform/VSCode/Type.js";

// The service type is Context.Tag.Service<typeof TagInstance>
type HostServiceImpl = Context.Tag.Service<typeof HostServiceTag>;

export const HostServiceLivePlaceholder: Layer.Layer<
	// The service type this layer provides
	HostServiceImpl,
	// The error type of this layer's construction (never for succeed)
	never,
	// The context required by this layer to be built (never for succeed)
	never
> = Layer.succeed(
	// The Tag instance we are providing for
	HostServiceTag,

	HostServiceTag.of({
		// Create an instance of the service interface
		openWindow: (
			targets: ReadonlyArray<
				| FolderOpenSpecification
				| FileOpenSpecification
				| WorkspaceOpenSpecification
			>,

			options?: WindowOpenOption,
		): Promise<void> => {
			console.log(
				"[MockHostService] openWindow called with:",

				targets,

				options,
			);

			return Promise.resolve();
		},
	}),
);
