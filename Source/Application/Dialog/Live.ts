// Application/Dialog/Live.ts
// Purpose: Defines the Layer that provides the live implementation of the File Dialog Service.

import { Layer } from "effect";

import Definition from "./Definition.js"; // The service implementation object
import DialogServiceTag from "./Tag.js"; // The Tag for IFileDialogService

/**
 * @module Live (Service Layer)
 * @description Provides the live implementation of the IFileDialogService.
 * This layer makes the DialogService (our Definition) available in the Effect context
 * via the FileDialogServiceTag. The actual runtime to execute Effects within the
 * Definition's methods is part of the Definition itself now.
 */
const Live = Layer.succeed(DialogServiceTag, Definition);

export default Live;
