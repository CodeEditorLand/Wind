import { Context } from "effect";

import type { LabelService } from "../Interface/LabelService.js";

export class LabelServiceTag extends Context.Tag("Application/LabelService")<
	LabelServiceTag,
	LabelService
>() {}

export const Label = LabelServiceTag;

export default LabelServiceTag;
