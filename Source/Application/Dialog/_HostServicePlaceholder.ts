// Application/Dialog/_HostServicePlaceholder.ts
import { Layer, type Context } from "effect";

// Import the actual Tag instance for the host service
import { HostServiceTag } from "../../Platform/VSCode/Provide.js";
// Import types for method signatures
import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../../Platform/VSCode/Type.js";

// Infer the service type from the Tag
type HostServiceImpl = Context.Tag.Service<typeof HostServiceTag>;

/**
 * @description A live Layer that provides a placeholder implementation for the HostService.
 * This implementation logs calls to `openWindow` to the console and resolves immediately.
 * It's useful for development or testing scenarios where a full host environment is not available
 * or not needed for the specific functionality being tested.
 * This layer provides the `HostServiceImpl` for the `HostServiceTag`.
 * It has no build errors (second generic param of Layer) and requires no specific context to be built (third generic param).
 */
export const HostServiceLivePlaceholder: Layer.Layer<
	// The service type this layer provides
	HostServiceImpl,
	// The error type of this layer's construction (never for succeed)
	never,
	// The context required by this layer to be built (never for succeed)
	never
> = Layer.succeed(
	// The Tag instance we are providing an implementation for
	HostServiceTag,

	// The implementation of HostServiceImpl (which is PerformAction)
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

				// Stringify for better console readability
				JSON.stringify(targets, null, 2),

				"and options:",

				JSON.stringify(options, null, 2),
			);

			// Mock implementation resolves immediately
			return Promise.resolve();
		},

		// `satisfies` ensures the object matches the interface
	} satisfies HostServiceImpl,
);
