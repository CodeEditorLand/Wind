import { Context } from "effect";

import type { QuickInputService } from "../Interface/QuickInputService.js";

export class QuickInputServiceTag extends Context.Tag(
	"Application/QuickInputService",
)<QuickInputServiceTag, QuickInputService>() {}

export const QuickInput = QuickInputServiceTag;

export default QuickInputServiceTag;
