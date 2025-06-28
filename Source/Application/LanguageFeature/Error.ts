/**
 * @module Error (Application/LanguageFeature)
 * @description Defines domain-specific, tagged errors for language feature
 * provider registration.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs during the registration of a language
 * feature provider.
 */
export class ProviderRegistrationProblem extends Data.TaggedError(
	"ProviderRegistrationProblem",
)<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
