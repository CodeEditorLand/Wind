// Application/Dialog.ts
// Purpose: Main aggregator for the Dialog Service module.

export * from "./Dialog/Types.js"; // Exports OperationProblem, PickProblem, ServiceProblem

// OptionFactories are typically internal, but can be exported if needed by other modules.
// export * from "./Dialog/OptionFactories.js";

// Orchestrated logic functions are internal, service uses them.
// export * from "./Dialog/Orchestration.js";

export { default as LiveDialogService } from "./Dialog/Live.js"; // Exports the Layer
export { default as DialogService } from "./Dialog/Definition.js"; // Exports the service implementation object

// Standalone utilities that were part of the original class's protected/public API
export * from "./Dialog/Utilities.js";
