/*
 * File: Wind/Source/Application/Instantiation.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:34 UTC
 * Export: default, type Interface
 */

// A new module for the Instantiation service dependency
export { default as InstantiationServiceTag } from "./Instantiation/Tag.js";
export { default as LiveInstantiationService } from "./Instantiation/Live.js";

export { default as LiveInstantiationService } from "./Instantiation/Live.js";
export {
	default as InstantiationServiceTag,
	type Interface as Instantiation,
} from "./Instantiation/Tag.js";
