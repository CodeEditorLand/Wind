// Application/Dialog/Type/PickProblem.ts
// Purpose: Defines an error union for "pick and open" operations.

// Use error aggregator
import { WindowProblem } from "../../../Integration/Tauri/Error.js";
import type OperationProblem from "./OperationProblem.js";

/**
 * @module PickProblem (Type)
 * @description Union type for errors during "pick and open" operations,


 * including dialog operation problems and window opening problems.
 */
export type Type = OperationProblem | WindowProblem;

export type { Type as default };
