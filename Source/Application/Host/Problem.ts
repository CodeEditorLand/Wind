/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for host-level operations
 * at the application layer. This error type serves as the single failure
 * contract for the `HostService`.
 */

import { Data } from "effect";

import type { IntegrationProblem } from "../Integration/Problem.js";

/**
 * Represents a failure within the `HostService`.
 *
 * This error is used to wrap failures that occur during critical startup
 * operations, such as fetching initial configuration from the native host, or
 * during interactions like showing native dialogs. It encapsulates lower-level
 * issues, like an `IntegrationProblem`, to provide a clean, high-level error
 * for consuming services.
 */
export class HostProblem extends Data.TaggedError("HostProblem")<{
	/**
	 * The underlying problem that caused this failure.
	 */
	readonly Cause: IntegrationProblem;
	/**
	 * A string describing the context of the operation that failed.
	 */
	readonly Context: string;
}> {}
