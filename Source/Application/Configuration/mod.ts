/*
 * File: Wind/Source/Application/Configuration/mod.ts
 * Responsibility: Provides the Configuration service definition (interface, live implementation, errors, and DI tag) for the Sky frontend to manage application settings and communicate with the Mountain backend via the Echo API.
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: ./Error/mod.js, ./Live.js
 * Export: Interface, Live, Problem, Tag
 */

/**
 * @module Configuration (Application)
 * @description This module provides the complete public API for the Configuration service.
 * It aggregates and exports the service interface, context tag, live implementation
 * layer, and domain-specific error types.
 */

import { ConfigurationProblem as ConfigurationServiceProblem } from "./Error/mod.js";
import { Live as LiveConfigurationServiceLayer } from "./Live.js";
import {
	Tag as ConfigurationServiceTag,
	type Interface as ConfigurationServiceInterface,
} from "./Service.js";

/**
 * The Context.Tag for the Configuration service.
 * @see Service.Interface
 */
export const Tag = ConfigurationServiceTag;
export type Interface = ConfigurationServiceInterface;

/**
 * The live implementation Layer for the Configuration service.
 * @see Live
 */
export const Live = LiveConfigurationServiceLayer;

/**
 * The domain-specific error for Configuration service operations.
 * @see Error.Problem
 */
export const Problem = ConfigurationServiceProblem;
export type Problem = ConfigurationServiceProblem;
