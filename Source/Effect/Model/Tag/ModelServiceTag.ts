import { Context } from "effect";

import type { ModelService } from "../Interface/ModelService.js";

export class ModelServiceTag extends Context.Tag("Application/ModelService")<
	ModelServiceTag,
	ModelService
>() {}

export const Model = ModelServiceTag;

export default ModelServiceTag;
