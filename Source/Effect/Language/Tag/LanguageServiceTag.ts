import { Context } from "effect";

import type { LanguageService } from "../Interface/LanguageService.js";

export class LanguageServiceTag extends Context.Tag(
	"Application/LanguageService",
)<LanguageServiceTag, LanguageService>() {}

export const Language = LanguageServiceTag;

export default LanguageServiceTag;
