/*
 * File: Wind/Source/Application/Dialog/mod.ts
 * Responsibility: Aggregates and exports the public API (interface, tag, live implementation, and errors) for the Dialog service in the Wind sidecar, enabling native dialog interactions (e.g., open/save files) by communicating with the Mountain backend over the Vine IPC layer.
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: ./Error/mod.js, ./Live.js
 * Export: Interface, Live, Problem, Tag
 */

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
