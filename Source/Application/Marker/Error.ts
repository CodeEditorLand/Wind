/**
 * @module Error (Application/Marker)
 * @description Defines domain-specific, tagged errors for marker service operations.
 */

import { Data } from "effect";

/**
 * Represents a failure that occurs within the `MarkerService`, such as an
 * inability to set up event listeners or fetch diagnostic data from the host.
 */
export class MarkerProblem extends Data.TaggedError("MarkerProblem")<{
	readonly Cause: unknown;
	readonly Context: string;
}> {}
