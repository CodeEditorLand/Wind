// Platform/VSCode/Provide.ts
// Purpose: Aggregates VSCode service tags and interfaces.

export {
	// Exporting the Tag with a more specific name
	default as HostServiceTag,

	// Exporting the interface type with a clearer name
	type PerformAction as HostService,
} from "./Provide/Host.js";

// ... Add other service tag exports here as they are defined.
