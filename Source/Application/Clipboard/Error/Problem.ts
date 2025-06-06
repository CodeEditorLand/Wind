import { Data } from "effect";
import { ClipboardProblem as IntegrationProblem } from "../../../Integration/Clipboard.js";

export default class Problem extends Data.TaggedError(
	"ApplicationClipboardProblem",
)<{
	readonly cause: IntegrationProblem;
}> {}

import { Data } from "effect";
import { ClipboardProblem as IntegrationProblem } from "../../../Integration/Clipboard.js";

export default class Problem extends Data.TaggedError(
	"ApplicationClipboardProblem",
)<{
	readonly cause: IntegrationProblem;
}> {}
