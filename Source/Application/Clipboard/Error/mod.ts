

/**
 * @module Error (Clipboard/Application)
 * @description This module serves as the public entry point for all errors
 * related to the Clipboard application service. It aggregates and re-exports
 * the detailed error definitions from its sub-modules.
 */

import { Problem as ClipboardProblemSource } from "./Problem.js";

/**
 * A domain-specific error representing a failure within the Clipboard service.
 * @see Problem
 */
export const ClipboardProblem = ClipboardProblemSource;
export type ClipboardProblem = ClipboardProblemSource;
