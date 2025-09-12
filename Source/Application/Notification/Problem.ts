/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for notification service operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs within the `NotificationService`, for example,
 * when a request to the host to show a notification fails.
 */
export class NotificationProblem extends Data.TaggedError(
	"NotificationProblem",
)<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
