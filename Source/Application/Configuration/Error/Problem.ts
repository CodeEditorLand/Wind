/*
 * File: Wind/Source/Application/Configuration/Error/Problem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:46 UTC
 * Dependency: effect
 * Export: Problem
 */

import { Data } from "effect";

import {
	FileSystemProblem,
	JsonParseProblem,
} from "../../../Integration/Configuration.js";

export default class Problem extends Data.TaggedError("ConfigurationProblem")<{
	readonly cause: FileSystemProblem | JsonParseProblem;
	readonly context: string;
}> {}
