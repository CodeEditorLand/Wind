// Application/Dialog/Type/PickProblem.ts
// Purpose: Defines an error union for "pick and open" operations.

import { WindowProblem } from "../../../Integration/Tauri/Error.js"; // Use error aggregator
import type OperationProblem from "./OperationProblem.js";

/**
 * @module PickProblem (Type)
 * @description Union type for errors during "pick and open" operations,
 * including dialog operation problems and window opening problems.
 */
type Type = OperationProblem | WindowProblem;
export default Type;
