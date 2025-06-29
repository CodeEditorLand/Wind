/**
 * @module Service (Application/Cancellation)
 * @description Stub service definition for Cancellation.
 * This file is a stub created to resolve dependencies.
 */

import { Effect } from "effect";

/**
 * The contract for the Cancellation service.
 */
export interface Cancellation {
	readonly CancelToken: (TokenId: number) => Effect.Effect<void, never>;
}

/**
 * The `Effect.Service` for the Cancellation service.
 */
export class CancellationService extends Effect.Service<Cancellation>()(
	"Service/Cancellation",
	{
		sync: () => ({
			CancelToken: (_TokenId: number) => Effect.void,
		}),
	},
) {}
