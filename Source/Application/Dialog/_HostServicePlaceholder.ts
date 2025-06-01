// Application/Dialog/_HostServicePlaceholder.ts
import { Layer } from "effect";

// Unused
// import { Context } from "effect";

// Unused
// import { Effect } from "effect";

import {
	HostServiceTag,
	// Unused
	// type HostService,
} from "../../Platform/VSCode/Provide.js";
import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../../Platform/VSCode/Type.js";

// Access the service type via `HostServiceTag.Type` (or `Context.Tag.Service<typeof HostServiceTag>`)
export const HostServiceLivePlaceholder: Layer.Layer<
	// This should now correctly refer to PerformAction
	typeof HostServiceTag.Type,
	never,
	never
> = Layer.succeed(
	HostServiceTag,

	HostServiceTag.of({
		// Tag.of is the correct way to create a service instance for a Tag
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
