import { Data } from "effect";

import { DialogProblem } from "../../../Integration/Tauri.js";

export default class Problem extends Data.TaggedError("NotificationProblem")<{
	readonly cause: DialogProblem | Error;
	readonly context: string;
}> {}
