/*
 * File: Wind/Source/Application/Dialog/Type/ServiceProblem.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:29:04 UTC
 * Dependency: ../../../Integration/Tauri/Error.js, ./PickProblem.js
 * Export: Type
 */

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
