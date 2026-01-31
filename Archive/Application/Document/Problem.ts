/**
 * @module Problem
 * @description
 * Defines domain-specific, tagged errors for document operations at the
 * application layer. This provides structured error types for handling
 * document-related failures.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs when a requested document cannot be found
 * in the document registry.
 */
export class DocumentNotFoundProblem extends Data.TaggedError(
	"DocumentNotFoundProblem",
)<{
	readonly Uri: string;
}> {}

/**
 * Represents a failure during the registration or execution of a content
 * provider for a virtual document.
 */
export class ContentProviderProblem extends Data.TaggedError(
	"ContentProviderProblem",
)<{
	readonly Cause: unknown;
	readonly Scheme: string;
	readonly Context: string;
}> {}
