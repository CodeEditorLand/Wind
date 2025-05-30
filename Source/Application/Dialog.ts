// Application/Dialog.ts
// Purpose: Main aggregator for the Dialog Service module.

// Export service-specific error union types
export * from "./Dialog/Types.js";

// Export the Layer (Live) and the Service Tag (FileDialogServiceTag from Live.ts)
// Also export the service implementation object (Definition) if direct use is intended,
// though typically interaction is via the Tag and Layer.
export {
	default as LiveDialogService,
	FileDialogServiceTag,
	type FileDialogService as FileDialogServiceInterface,
} from "./Dialog/Live.js";
export { default as DialogServiceDefinition } from "./Dialog/Definition.js"; // The concrete implementation

// Export standalone utilities that were part of the original class's API
export * from "./Dialog/Utilities.js";
