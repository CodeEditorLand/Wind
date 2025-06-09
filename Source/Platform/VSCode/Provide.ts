/*
 * File: Wind/Source/Platform/VSCode/Provide.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:28:56 UTC
 * Export: // Exporting the Tag with a more specific name
	default, // Exporting the interface type with a clearer name
	type PerformAction
 */

// Platform/VSCode/Provide.ts
// Purpose: Aggregates VSCode service tags and interfaces.

export {
	// Exporting the Tag with a more specific name
	default as HostServiceTag,

	// Exporting the interface type with a clearer name
	type PerformAction as HostService,
} from "./Provide/Host.js";

// ... Add other service tag exports here as they are defined.
