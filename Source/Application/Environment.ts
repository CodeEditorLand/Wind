/*
 * File: Wind/Source/Application/Environment.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:41 UTC
 * Export: default, type Interface
 */

export { default as LiveEnvironmentService } from "./Environment/Live.js";
export {
	default as EnvironmentServiceTag,
	type Interface as Environment,
} from "./Environment/Tag.js";

// Note: We do not export the Definition directly, only the Live Layer.
