/**
 * @module Service (Application/Marker)
 * @description Defines the MarkerService, which listens for diagnostic changes from the
 * backend and updates the Monaco Editor's model markers.
 */
import { Effect } from "effect";

import { MarkerProblem } from "./Error.js";

/**
 * The DTO for a single marker received from the Mountain host.
 */
export interface MarkerDataDTO {
	readonly Severity: number;
	readonly Message: string;
	readonly Source?: string;
	readonly StartLineNumber: number;
	readonly StartColumn: number;
	readonly EndLineNumber: number;
	readonly EndColumn: number;
}
/**
 * The contract for the MarkerService. Its primary job is to listen for
 * backend events and orchestrate updates to the editor UI.
 */
export interface Marker {
	/**
	 * Initializes the service, registering all necessary event listeners to react
	 * to changes from the backend. This is an Effect that runs once at startup.
	 */
	readonly Initialize: () => Effect.Effect<void, MarkerProblem>;
}
declare const MarkerService_base: Effect.Service.Class<
	Marker,
	"Wind/MarkerService",
	{
		readonly effect: Effect.Effect<
			{
				Initialize: () => Effect.Effect<void, MarkerProblem>;
			},
			unknown,
			unknown
		>;
	}
>;
/**
 * The `Effect.Service` for the `MarkerService`.
 */
export declare class MarkerService extends MarkerService_base {}
export {};
