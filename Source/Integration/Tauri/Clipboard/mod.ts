/**
 * @module Clipboard (Integration/Tauri)
 * @description This module serves as the public entry point for all clipboard-related
 * functionality within the Tauri Integration Layer.
 *
 * It aggregates and exports:
 * - Effect wrappers for calling the native clipboard APIs (`Wrap`).
 * - Pure functions for converting data formats (`Convert`).
 * - Domain-specific error types (`Error`).
 */

export * from "./Error/mod.js";
export * from "./Wrap/mod.js";
export * from "./Convert/mod.js";
