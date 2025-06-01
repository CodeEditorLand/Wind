// Integration/Tauri/Errors.ts
// Purpose: Aggregates custom error types for Tauri integrations with descriptive aliases.

import DialogProblemSource from "./Error/Dialog.js";
import InheritanceProblemSource from "./Error/Inheritance.js";
import PathProblemSource from "./Error/Path.js";
import WindowProblemSource from "./Error/Window.js";

/** Error during Tauri path operations. */
export const PathProblem = PathProblemSource;

export type PathProblem = PathProblemSource;

/** Error during Tauri dialog operations. */
export const DialogProblem = DialogProblemSource;

export type DialogProblem = DialogProblemSource;

/** Error during VSCode HostService window operations. */
export const WindowProblem = WindowProblemSource;

export type WindowProblem = WindowProblemSource;

/** Error emulating a superclass method call. */
export const InheritanceProblem = InheritanceProblemSource;

export type InheritanceProblem = InheritanceProblemSource;
