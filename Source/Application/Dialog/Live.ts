// Application/Dialog/Live.ts
// Purpose: Defines the Layer that provides the live implementation of the File Dialog Service.

import { Layer } from "effect";

// The service implementation object
import Definition from "./Definition.js";
// The Tag for IFileDialogService
// Import the Tag instance directly
import ActualDialogServiceTag from "./Tag.js";

/**
 * @module Live (Service Layer)
 * @description Provides the live implementation of the IFileDialogService.
 * This layer makes the DialogService (our Definition) available in the Effect context
 * via the FileDialogServiceTag.
 */
const Live: Layer.Layer<typeof ActualDialogServiceTag.Type, never, never> =
	Layer.succeed(
		// Pass the Tag instance
		ActualDialogServiceTag,

		// Definition must implement typeof ActualDialogServiceTag.Type
		Definition,
	);

export default Live;
