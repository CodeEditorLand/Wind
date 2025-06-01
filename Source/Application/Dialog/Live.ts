// Application/Dialog/Live.ts
// Purpose: Defines the Layer that provides the live implementation of the File Dialog Service.

import { Layer, type Context } from "effect";

// The concrete implementation
import Definition from "./Definition.js";
// Import the Tag for the FileDialogService
import ActualDialogServiceTag from "./Tag.js";

// Infer the service type from the Tag
type DialogServiceType = Context.Tag.Service<typeof ActualDialogServiceTag>;

/**
 * @description A live Layer that provides the concrete implementation (`Definition`)
 * for the `ActualDialogServiceTag`. This layer can be included in an application's
 * main layer to make the `IFileDialogService` available throughout the application via Effect's context.
 * This layer has no construction errors and no requirements itself, as `Definition` is self-contained
 * (or its dependencies are managed via its internal runtime).
 */
const Live: Layer.Layer<
	// Service provided
	DialogServiceType,
	// No error during construction
	never,
	// No requirements to build this layer
	never
> = Layer.succeed(
	// The Tag being implemented
	ActualDialogServiceTag,

	// The implementation object
	Definition,
);

export default Live;
