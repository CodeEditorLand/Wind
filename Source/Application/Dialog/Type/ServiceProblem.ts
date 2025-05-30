// Application/Dialog/Type/ServiceProblem.ts
// Purpose: Defines the overall error union for the File Dialog Service.

import { InheritanceProblem } from "../../../Integration/Tauri/Errors.js"; // Use error aggregator
import type PickProblem from "./PickProblem.js";

/**
 * @module ServiceProblem (Type)
 * @description Overall error union for the File Dialog Service,
 * encompassing pick problems and potential issues from emulating superclass calls.
 */
type Type = PickProblem | InheritanceProblem;
export default Type;
