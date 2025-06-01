// Application/Dialog/_HostServicePlaceholder.ts
import { Layer } from "effect";

import HostServiceTag, {
	type PerformAction,
} from "../../Platform/VSCode/Provide/Host.js";
// This is Tag<PerformAction, PerformAction>

// Import the interface directly
import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../../Platform/VSCode/Type.js";

/**
 * @description A live Layer that provides a placeholder implementation for the HostService.
 * This layer provides the service associated with `HostServiceTag`.
 * TypeScript infers the Layer's type from `Layer.succeed`.
 * It should be Layer.Layer<typeof HostServiceTag, never, never>.
 */
export const HostServiceLivePlaceholder = Layer.succeed(
	// The Tag instance
	HostServiceTag,

	// The implementation of PerformAction
	{
		openWindow: (
			targets: ReadonlyArray<
				| FolderOpenSpecification
				| FileOpenSpecification
				| WorkspaceOpenSpecification
			>,

			options?: WindowOpenOption,
		): Promise<void> => {
			console.log(
				"[MockHostService] openWindow called with targets:",

				JSON.stringify(targets, null, 2),

				"and options:",

				JSON.stringify(options, null, 2),
			);

			return Promise.resolve();
		},

		// Explicitly satisfy the interface
	} satisfies PerformAction,
);
