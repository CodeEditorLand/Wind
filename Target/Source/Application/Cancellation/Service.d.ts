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
declare const CancellationService_base: Effect.Service.Class<
	Cancellation,
	"Service/Cancellation",
	{
		readonly sync: () => {
			CancelToken: (
				_TokenId: number,
			) => Effect.Effect<void, never, never>;
		};
	}
>;
/**
 * The `Effect.Service` for the Cancellation service.
 */
export declare class CancellationService extends CancellationService_base {}
export {};
