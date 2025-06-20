

/**
 * @module Editor (Application)
 * @description This module provides the complete public API for the Editor service.
 * It aggregates and exports the service interface, context tag, live implementation
 * layer, and domain-specific error types.
 */

import { Problem as EditorServiceProblem } from "./Error/mod.js";
import { Live as LiveEditorServiceLayer } from "./Live.js";
import {
	Tag as EditorServiceTag,
	type Interface as EditorServiceInterface,
} from "./Service.js";

/**
 * The Context.Tag for the Editor service.
 * @see Service.Interface
 */
export const Tag = EditorServiceTag;
export type Interface = EditorServiceInterface;

/**
 * The live implementation Layer for the Editor service.
 * @see Live
 */
export const Live = LiveEditorServiceLayer;

/**
 * The domain-specific error for Editor service operations.
 * @see Error.Problem
 */
export const Problem = EditorServiceProblem;
export type Problem = EditorServiceProblem;
