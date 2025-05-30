// Application/Dialog/Type/PickProblem.ts

import type { WindowProblem } from "../../../Integration/Tauri.js"; // Use aggregator
import type OperationProblem from "./OperationProblem.js";

/**
 * @module PickProblem
 * @description Union type for errors during "pick and open" operations,
 * including dialog operation errors and window opening errors.
 */
type PickProblem = OperationProblem | WindowProblem;
export default PickProblem;
