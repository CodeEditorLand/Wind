// Application/Dialog/Type/ServiceProblem.ts

import type { InheritanceProblem } from "../../../Integration/Tauri.js"; // Use aggregator
import type PickProblem from "./PickProblem.js";

/**
 * @module ServiceProblem
 * @description Overall error union for the File Dialog Service,
 * encompassing pick problems and potential issues from emulating superclass calls.
 */
type ServiceProblem = PickProblem | InheritanceProblem;
export default ServiceProblem;
