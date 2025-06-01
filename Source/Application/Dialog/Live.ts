// Application/Dialog/Live.ts
// Purpose: Defines the Layer that provides the live implementation of the File Dialog Service.

import { Layer } from "effect";

// The service implementation object
import Definition from "./Definition.js";
// The Tag for IFileDialogService
import DialogServiceTag from "./Tag.js";

/**
 * @module Live (Service Layer)
 * @description Provides the live implementation of the IFileDialogService.
 * This layer makes the DialogService (our Definition) available in the Effect context
 * via the FileDialogServiceTag. The actual runtime to execute Effects within the
 * Definition's methods is part of the Definition itself now.
 */
const Live = Layer.succeed(DialogServiceTag, Definition);

export default Live;
