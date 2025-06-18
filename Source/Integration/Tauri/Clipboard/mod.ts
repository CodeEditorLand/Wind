/*
 * File: Wind/Source/Integration/Tauri/Clipboard/mod.ts
 * Responsibility: Serves as the public entry point for clipboard operations in the Tauri Integration Layer, aggregating and exporting error types, native API wrappers, and format converters to provide a unified interface for the Sky frontend to interact with the native clipboard via the Mountain backend.
 * Modified: 2025-06-09 15:50:36 UTC
 */

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
