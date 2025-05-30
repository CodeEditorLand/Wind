// Application/Dialog.ts
// Purpose: Main aggregator for the Dialog Service module.

export * from "./Dialog/Types.js"; // Error type aliases

export { default as LiveDialogService } from "./Dialog/Live.js";
export {
	default as DialogServiceTag,
	type Interface as FileDialog,
} from "./Dialog/Tag.js"; // Export Tag & Interface
export { default as DialogServiceDefinition } from "./Dialog/Definition.js";

export * from "./Dialog/Utilities.js"; // Standalone utilities
