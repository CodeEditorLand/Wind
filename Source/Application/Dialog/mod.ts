

/**
 * @module Dialog (Application)
 * @description This module provides the complete public API for the Dialog service.
 * It aggregates and exports the service interface, context tag, live implementation
 * layer, and domain-specific error types.
 */

import { ServiceProblem as DialogServiceProblem } from "./Error/mod.js";
import { Live as LiveDialogServiceLayer } from "./Live.js";
import {
	Tag as DialogServiceTag,
	type Interface as DialogServiceInterface,
} from "./Service.js";

/**
 * The Context.Tag for the Dialog service.
 * @see Service.Interface
 */
export const Tag = DialogServiceTag;
export type Interface = DialogServiceInterface;

/**
 * The live implementation Layer for the Dialog service.
 * @see Live
 */
export const Live = LiveDialogServiceLayer;

/**
 * The domain-specific error for Dialog service operations.
 * @see Error.Problem
 */
export const Problem = DialogServiceProblem;
export type Problem = DialogServiceProblem;
