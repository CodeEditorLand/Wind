/**
 * @module Problem
 * @description
 * Defines a tagged error for path-resolution failures at the
 * integration layer.
 */

import { Data } from "effect";

/**
 * Represents a failure when resolving a filesystem path via the Tauri API.
 */
export class TauriPathProblem extends Data.TaggedError("TauriPathProblem")<{
	readonly Cause?: unknown;
	readonly Context: string;
}> {}
