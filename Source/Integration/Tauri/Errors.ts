// Integration/Tauri/Errors.ts
// Purpose: Aggregates and exports custom error types for Tauri integrations.

// Import the default class export and re-export with a specific name
import DialogProblemClass from "./Error/Dialog.js";
import InheritanceProblemClass from "./Error/Inheritance.js";
import PathProblemClass from "./Error/Path.js";
import WindowProblemClass from "./Error/Window.js";

/** Represents a problem during Tauri path operations. */
export const PathProblem = PathProblemClass;
export type PathProblem = PathProblemClass; // Export instance type

/** Represents a problem during Tauri dialog operations. */
export const DialogProblem = DialogProblemClass;
export type DialogProblem = DialogProblemClass;

/** Represents a problem with VSCode HostService window operations. */
export const WindowProblem = WindowProblemClass;
export type WindowProblem = WindowProblemClass;

/** Represents a problem emulating a superclass call. */
export const InheritanceProblem = InheritanceProblemClass;
export type InheritanceProblem = InheritanceProblemClass;
