// Application/Dialog/Live.ts
// Purpose: Defines the Layer that provides the live implementation of the File Dialog Service.

import { Layer, type Context } from "effect";

import Definition from "./Definition.js";
import ActualDialogServiceTag from "./Tag.js";

type DialogServiceType = Context.Tag.Service<typeof ActualDialogServiceTag>;

const Live: Layer.Layer<DialogServiceType, never, never> = Layer.succeed(
	ActualDialogServiceTag,

	Definition,
);

export default Live;
