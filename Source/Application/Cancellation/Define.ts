/**
 * @module Define
 * @description
 * Defines the service for handling cancellation signals for long-running
 * operations. This provides a clean abstraction for sending cancellation
 * requests to the backend.
 */

import { Effect } from "effect";

/**
 * The contract for the `CancellationService`.
 */
export interface Interface {
	/**
	 * Creates an `Effect` that sends a cancellation signal for a specific
	 * operation, identified by its token ID.
	 *
	 * @param TokenID The unique identifier of the operation to be cancelled.
	 * @returns An `Effect` that completes when the cancellation signal has been sent.
	 * It does not produce a value and is not expected to fail.
	 */
	readonly CancelToken: (TokenID: number) => Effect.Effect<void>;
}

/**
 * The `Effect.Service` for the `CancellationService`.
 *
 * This service is responsible for propagating cancellation requests. The default
 * implementation is a stub that performs no operation, allowing for progressive
 * implementation of the cancellation feature without blocking other components.
 */
export class CancellationService extends Effect.Service<Interface>()(
	"Service/Cancellation",
	{
		sync: () => ({
			CancelToken: (_TokenID: number) => Effect.void,
		}),
	},
) {}
