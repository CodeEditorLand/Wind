/*
 * File: Wind/Source/Effect/Produce/mod.ts
 * Responsibility:
 * Modified: 2025-06-09 15:50:37 UTC
 * Export: FromAsync, FromMethod, OptionalFromAsync, OptionalFromMethod
 */

/**
 * @module Produce (Effect)
 * @description This module provides a set of powerful higher-order functions for
 * creating Effects. These utilities are the cornerstone of the Integration Layer,
 * allowing for the clean, standardized wrapping of impure, side-effectful functions
 * (both standalone and class methods) into declarative Effects with typed errors.
 */

// --- Type Definitions ---

/**
 * Re-exports the core type definitions used by the producer functions.
 */
export type { AsyncFunction, ErrorProducer } from "./Type.js";

// --- Effect Producers ---

/**
 * Creates an Effect-returning function from a promise-returning async function.
 * @see FromAsync
 */
export { FromAsync } from "./FromAsync.js";

/**
 * Creates an Effect-returning function from a class method that returns a promise.
 * @see FromMethod
 */
export { FromMethod } from "./FromMethod.js";

/**
 * Creates an Effect-returning function from a promise-returning async function
 * that can resolve to `null` or `undefined`, converting the result to an `Option`.
 * @see OptionalFromAsync
 */
export { OptionalFromAsync } from "./OptionalFromAsync.js";

/**
 * Creates an Effect-returning function from a class method that returns a promise
 * which can resolve to `null` or `undefined`, converting the result to an `Option`.
 * @see OptionalFromMethod
 */
export { OptionalFromMethod } from "./OptionalFromMethod.js";
