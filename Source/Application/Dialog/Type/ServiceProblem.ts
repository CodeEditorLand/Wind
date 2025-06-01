// Application/Dialog/Type/ServiceProblem.ts
// Purpose: Defines the overall error union for the File Dialog Service.

// Use error aggregator
import { InheritanceProblem } from "../../../Integration/Tauri/Error.js";
import type PickProblem from "./PickProblem.js";

/**
 * @module ServiceProblem (Type)
 * @description Overall error union for the File Dialog Service,
 * encompassing pick problems and potential issues from emulating superclass calls.
 */
export type Type = PickProblem | InheritanceProblem;

export type { Type as default };
