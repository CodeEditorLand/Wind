/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for editor operations at the
 * application layer.
 */

import { Data } from "effect";

import type { HostProblem } from "../Host/Problem.js";

/**
 * Represents a failure within the `EditorService`.
 * This error is used to wrap failures that occur during editor operations,
 * such as failing to resolve an editor input or an error from the host service
 * when trying to open a file.
 */
export class EditorProblem extends Data.TaggedError("EditorProblem")<{
	readonly Cause: HostProblem | Error;
	readonly Context: string;
}> {}
