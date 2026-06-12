import { Context } from "effect";

import type { OutputService } from "../Interface/OutputService.js";

export class OutputServiceTag extends Context.Tag("Application/OutputService")<
	OutputServiceTag,

	OutputService
>() {}

export const Output = OutputServiceTag;

export default OutputServiceTag;
