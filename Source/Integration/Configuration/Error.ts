/*
 * File: Wind/Source/Integration/Configuration/Error.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:19 UTC
 * Dependency: ./Error/FileSystemProblem.js, ./Error/JsonParseProblem.js
 * Export: FileSystemProblem, JsonParseProblem
 */

import FileSystemProblemSource from "./Error/FileSystemProblem.js";
import JsonParseProblemSource from "./Error/JsonParseProblem.js";

export const FileSystemProblem = FileSystemProblemSource;
export type FileSystemProblem = FileSystemProblemSource;

export const JsonParseProblem = JsonParseProblemSource;
export type JsonParseProblem = JsonParseProblemSource;
