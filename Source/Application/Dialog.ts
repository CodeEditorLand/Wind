// Application/Dialog.ts
// Purpose: Main aggregator for the Dialog Service module.

// Error type aliases
export * from "./Dialog/Type.js";

export { default as LiveDialogService } from "./Dialog/Live.js";

export {
	default as DialogServiceTag,
	type Interface as FileDialog,

	// Export Tag & Interface
} from "./Dialog/Tag.js";

export { default as DialogServiceDefinition } from "./Dialog/Definition.js";

// Standalone utilities
export * from "./Dialog/Utility.js";
