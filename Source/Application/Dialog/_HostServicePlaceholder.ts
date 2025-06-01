// Application/Dialog/_HostServicePlaceholder.ts
import { Layer } from "effect";

// Unused TS6133
// import { Context } from "effect";

// Unused TS6133
// import { Effect } from "effect";

import {
	// Import the Tag instance
	HostServiceTag,
	// Unused TS6133 (service type derived from Tag)
	// type HostService,
} from "../../Platform/VSCode/Provide.js";
import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../../Platform/VSCode/Type.js";

// This is a placeholder. In a real application, you'd import the actual live layer for HostService.

export const HostServiceLivePlaceholder: Layer.Layer<
	// Use Tag.Type for the service type in Layer
	typeof HostServiceTag.Type,
	never,
	never
> = Layer.succeed(
	// Provide the Tag instance
	HostServiceTag,

	HostServiceTag.of({
		// Use Tag.of to create an implementation that matches the service type
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
