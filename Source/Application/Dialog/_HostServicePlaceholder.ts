// Application/Dialog/_HostServicePlaceholder.ts
// Context might be needed for Tag.Service
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
	// Use the derived service type
	HostServiceImpl,
	never,
	never
> = Layer.succeed(
	// Pass the Tag instance
	HostServiceTag,

	HostServiceTag.of({
		// Use Tag.of with an implementation matching HostServiceImpl
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
