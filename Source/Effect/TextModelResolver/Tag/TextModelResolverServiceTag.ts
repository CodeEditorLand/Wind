import { Context } from "effect";

import type { TextModelResolverService } from "../Interface/TextModelResolverService.js";

export class TextModelResolverServiceTag extends Context.Tag(
	"Application/TextModelResolverService",
)<TextModelResolverServiceTag, TextModelResolverService>() {}

export const TextModelResolver = TextModelResolverServiceTag;

export default TextModelResolverServiceTag;
