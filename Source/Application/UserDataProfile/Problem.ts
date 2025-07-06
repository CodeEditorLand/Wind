/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for user profile operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs within the `UserDataProfileService` or
 * `UserDataProfilesService`, such as failing to create, update, or remove a
 * user profile.
 */
export class UserDataProfileProblem extends Data.TaggedError(
	"UserDataProfileProblem",
)<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
