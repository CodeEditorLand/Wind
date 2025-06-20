

/**
 * @module Clipboard (Application)
 * @description This module provides the complete public API for the Clipboard service.
 * It aggregates and exports the service interface, context tag, live implementation
 * layer, and domain-specific error types.
 */

import { ClipboardProblem as ClipboardServiceProblem } from "./Error/mod.js";
import { Live as LiveClipboardServiceLayer } from "./Live.js";
import {
	Tag as ClipboardServiceTag,
	type Interface as ClipboardServiceInterface,
} from "./Service.js";

/**
 * The Context.Tag for the Clipboard service.
 * @see Service.Interface
 */
export const Tag = ClipboardServiceTag;
export type Interface = ClipboardServiceInterface;

/**
 * The live implementation Layer for the Clipboard service.
 * @see Live
 */
export const Live = LiveClipboardServiceLayer;

/**
 * The domain-specific error for Clipboard service operations.
 * @see Error.Problem
 */
export const Problem = ClipboardServiceProblem;
export type Problem = ClipboardServiceProblem;
