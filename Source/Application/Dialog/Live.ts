// Application/Dialog/Live.ts
// Purpose: Defines the Layer that provides the live implementation of the File Dialog Service.

import { Layer } from "effect";
import { IFileDialogService } from "vs/platform/dialogs/common/dialogs"; // VSCode Interface used as Tag

import Definition from "./Definition.js"; // The service implementation object

/**
 * @module Live (Service Layer)
 * @description Provides the live implementation of the IFileDialogService.
 * This layer makes the DialogService available in the Effect context.
 * Dependencies required by the service methods (like ProvideHost)
 * are resolved when those methods' Effects are executed, not during layer construction itself,
 * unless the service *construction* itself was effectful and required context.
 */
const Live = Layer.succeed(
	IFileDialogService, // The Tag (VSCode interface)
	Definition, // The implementation object
);

export default Live;
