// Application/Dialog/Live.ts
// Purpose: Defines the Layer that provides the live implementation of the File Dialog Service.

import { Layer, type Context } from "effect";

import Definition from "./Definition.js";
// ActualDialogServiceTag is Context.Tag<Interface>
import ActualDialogServiceTag from "./Tag.js";

// The service type provided by this layer
type DialogServiceType = Context.Tag.Service<typeof ActualDialogServiceTag>;

const Live: Layer.Layer<DialogServiceType, never, never> = Layer.succeed(
	// The Tag instance
	ActualDialogServiceTag,

	// The implementation of DialogServiceType
	Definition,
);

export default Live;
