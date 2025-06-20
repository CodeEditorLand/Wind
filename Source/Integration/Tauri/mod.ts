

/**
 * @module Tauri (Integration)
 * @description This is the main aggregator for the Tauri Integration Layer.
 *
 * The Integration Layer is a critical architectural boundary. It is the *only*
 * part of the Wind application that is allowed to directly interact with the
 * `@tauri-apps/api`. It wraps every native call in a declarative `Effect`,
 * providing a safe, typed, and purely functional API for the rest of the
 * application to consume.
 *
 * This file re-exports all the necessary components from its sub-modules.
 */

// --- Re-export all sub-modules for consumption by the Application layer ---

/**
 * Wrappers for native Tauri API calls, returning Effects.
 * e.g., `ReadFile`, `ShowOpenDialog`, `ReadText`
 */
export * from "./Wrapper.js";

/**
 * Domain-specific, tagged errors for the integration layer.
 * e.g., `IntegrationFileSystemProblem`, `IntegrationDialogProblem`
 */
export * from "./Error.js";

/**
 * Pure data converters for translating between application-level types
 * and the types expected by the Tauri API.
 * e.g., `ConvertFiltersToTauri`
 */
export * from "./Converter.js";

/**
 * Service definitions that the integration layer consumes or provides.
 */
export * from "./Definition.js";

/**
 * Path and URI resolution utilities.
 */
export * from "./Path/mod.js";
