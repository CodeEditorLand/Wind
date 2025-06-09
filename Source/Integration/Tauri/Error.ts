/*
 * File: Wind/Source/Integration/Tauri/Error.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-01 22:28:58 UTC
 * Dependency: ./Error/Dialog.js, ./Error/Inheritance.js, ./Error/Path.js, ./Error/Window.js
 * Export: DialogProblem, InheritanceProblem, PathProblem, WindowProblem
 */

// Integration/Tauri/Error.ts
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
