// Integration/Tauri/Errors.ts
// Purpose: Aggregates and exports custom error types for Tauri integrations.

// Note: Since all error files export 'default class Problem',
// we need to alias them on import here to re-export with distinct names.
import DialogProblemFile from "./Error/Dialog.js";
import InheritanceProblemFile from "./Error/Inheritance.js";
import PathProblemFile from "./Error/Path.js";
import WindowProblemFile from "./Error/Window.js";

export const PathProblem = PathProblemFile;
export const DialogProblem = DialogProblemFile;
export const WindowProblem = WindowProblemFile;
export const InheritanceProblem = InheritanceProblemFile;
