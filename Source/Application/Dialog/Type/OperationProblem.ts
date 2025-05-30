// Application/Dialog/Type/OperationProblem.ts

// Import specific error types (instance types)
import type {
	PathProblem,
	DialogProblem as TauriDialogProblem,
} from "../../../Integration/Tauri/Errors.js";

/**
 * @module OperationProblem
 * @description Union type for errors that can occur during basic dialog operations.
 */
type OperationProblem = PathProblem | TauriDialogProblem;
// If 'verbatimModuleSyntax' is true and this file ONLY contains this type alias,
// 'export default' for a type alias is okay.
// The error TS1284 might arise if it's imported as a value.
export default OperationProblem;
