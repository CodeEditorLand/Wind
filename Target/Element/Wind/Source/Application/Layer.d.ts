/**
 * @module Layer (Application)
 * @description Defines the master application layer for the Wind workbench.
 * This layer is responsible for composing all individual live service
 * implementations into a single, cohesive, and fully-resolved dependency graph.
 * It serves as the complete dependency injection container for the application.
 */
import { Layer } from "effect";
/**
 * The master `AppLayer` for the Wind application.
 *
 * This layer composes all the live implementations of the application's
 * services into a single, injectable unit. By providing this layer to our main
 * application `Effect`, we satisfy all of its dependencies at once.
 *
 * It starts with the lowest-level integration layer and builds upon it.
 */
export declare const AppLayer: Layer.Layer<unknown, unknown, any>;
/**
 * A type alias representing the fully-resolved context provided by the `AppLayer`.
 * This can be useful for functions or tests that need to know the complete set
 * of available services.
 */
export type AppContext = Layer.Layer.Context<typeof AppLayer>;
