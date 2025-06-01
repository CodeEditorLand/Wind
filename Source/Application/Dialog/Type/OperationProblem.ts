// Application/Dialog/Type/OperationProblem.ts
// Purpose: Defines an error union for basic dialog operations.

// Import specific problem types from the Integration/Tauri module's error aggregator
import {
	PathProblem,
	DialogProblem as TauriDialogProblem,
} from "../../../Integration/Tauri/Error.js";

/**
 * @module OperationProblem (Type)
 * @description Union type for errors that can occur during basic dialog operations,

 * encompassing path resolution problems or Tauri dialog interaction problems.
 */
export type Type = PathProblem | TauriDialogProblem;

export type { Type as default };
