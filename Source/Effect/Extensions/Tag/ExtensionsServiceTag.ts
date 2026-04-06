import { Context } from "effect";

import type { ExtensionsService } from "../Interface/ExtensionsService.js";

export class ExtensionsServiceTag extends Context.Tag(
	"Application/ExtensionsService",
)<ExtensionsServiceTag, ExtensionsService>() {}

export const Extensions = ExtensionsServiceTag;

export default ExtensionsServiceTag;
