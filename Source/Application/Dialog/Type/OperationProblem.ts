// Application/Dialog/Type/OperationProblem.ts

import type {
	PathProblem,
	DialogProblem as TauriDialogProblem,
} from "../../../Integration/Tauri.js";

// Use aggregator

/**
 * @module OperationProblem
 * @description Union type for errors that can occur during basic dialog operations
 * (path resolution or Tauri dialog interaction).
 */
type OperationProblem = PathProblem | TauriDialogProblem;
export default OperationProblem;
