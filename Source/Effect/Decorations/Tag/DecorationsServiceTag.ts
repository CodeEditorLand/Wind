import { Context } from "effect";

import type { DecorationsService } from "../Interface/DecorationsService.js";

export class DecorationsServiceTag extends Context.Tag(
	"Application/DecorationsService",
)<DecorationsServiceTag, DecorationsService>() {}

export const Decorations = DecorationsServiceTag;

export default DecorationsServiceTag;
