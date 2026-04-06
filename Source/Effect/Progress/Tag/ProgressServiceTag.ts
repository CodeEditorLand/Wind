import { Context } from "effect";

import type { ProgressService } from "../Interface/ProgressService.js";

export class ProgressServiceTag extends Context.Tag(
	"Application/ProgressService",
)<ProgressServiceTag, ProgressService>() {}

export const Progress = ProgressServiceTag;
export default ProgressServiceTag;
