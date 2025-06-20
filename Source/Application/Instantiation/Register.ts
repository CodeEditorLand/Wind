

/**
 * @module Register (Instantiation)
 * @description Provides the mechanism for mapping legacy VS Code service constructors
 * to their modern `Effect.Layer` implementations.
 */

import { Layer } from "effect";

/**
 * A global map that stores the association between a legacy class constructor
 * and the `Effect.Layer` that provides its implementation.
 *
 * The `InstantiationService` consults this map to determine whether to use
 * modern, Layer-based DI or fall back to the legacy decorator-based DI for a
ticular class.
 */
export const LayerMap = new Map<any, Layer.Layer<any, any, any>>();

/**
 * A helper function to associate a legacy VS Code class constructor with its
 * corresponding `Effect.Layer`. This is the primary way to register new,
 * Effect-TS native services so that they can be instantiated by legacy parts
 * of the workbench.
 *
 * @param Constructor - The class constructor (e.g., `MyServiceClass`).
 * @param Layer - The `Effect.Layer` that provides the live implementation for
 *   the service (e.g., `LiveMyService`).
 */
export const RegisterService = (
	Constructor: any,
	Layer: Layer.Layer<any, any, any>,
): void => {
	LayerMap.set(Constructor, Layer);
};
