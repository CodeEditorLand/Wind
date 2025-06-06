import { Data } from "effect";

import {
	FileSystemProblem,
	JsonParseProblem,
} from "../../../Integration/Configuration.js";

export default class Problem extends Data.TaggedError("ConfigurationProblem")<{
	readonly cause: FileSystemProblem | JsonParseProblem;
	readonly context: string;
}> {}
