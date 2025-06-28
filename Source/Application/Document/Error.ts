/**
 * @module Error (Application/Document)
 * @description Defines domain-specific, tagged errors for document operations
 * at the application layer.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs when a requested document cannot be found.
 */
export class DocumentNotFoundProblem extends Data.TaggedError(
	"DocumentNotFoundProblem",
)<{
	readonly Uri: string;
}> {}

/**
 * Represents a failure during the registration of a content provider.
 */
export class ContentProviderProblem extends Data.TaggedError(
	"ContentProviderProblem",
)<{
	readonly Cause: unknown;
	readonly Scheme: string;
	readonly Context: string;
}> {}
