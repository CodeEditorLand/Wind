/**
 * @module EditorGroups (Application)
 * @description This module provides the complete public API for the EditorGroups service.
 * It aggregates and exports the service interface, context tag, live implementation
 * layer, and domain-specific error types.
 */

import { Problem as EditorGroupsServiceProblem } from "./Error/mod.js";
import { Live as LiveEditorGroupsServiceLayer } from "./Live.js";
import {
	Tag as EditorGroupsServiceTag,
	type Interface as EditorGroupsServiceInterface,
} from "./Service.js";

/**
 * The Context.Tag for the EditorGroups service.
 * @see Service.Interface
 */
export const Tag = EditorGroupsServiceTag;
export type Interface = EditorGroupsServiceInterface;

/**
 * The live implementation Layer for the EditorGroups service.
 * @see Live
 */
export const Live = LiveEditorGroupsServiceLayer;

/**
 * The domain-specific error for EditorGroups service operations.
 * @see Error.Problem
 */
export const Problem = EditorGroupsServiceProblem;
export type Problem = EditorGroupsServiceProblem;
