/**
 * @module Problem
 * @description
 * Defines a domain-specific, tagged error for failures that occur when
 * interacting with the native Tauri host at the integration layer.
 */

import { Data } from "effect";

/**
 * Represents a failure at the lowest level of native host interaction.
 *
 * This structured error is created by the `IntegrationService` when a call to
 * a Tauri command (`invoke`, `listen`, `emit`) fails. It captures the
 * underlying cause and the specific operation that failed, providing rich,
 * type-safe diagnostics for higher-level services.
 */
export class IntegrationProblem extends Data.TaggedError("IntegrationProblem")<{
	/**
	 * The underlying, unknown cause of the failure from the Tauri API.
	 */
	readonly Cause: unknown;
	/**
	 * A string literal identifying the specific integration operation that failed.
	 */
	readonly Context: "Invoke" | "Listen" | "Emit";
}> {}
