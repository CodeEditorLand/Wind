/*
 * File: Wind/Source/Application/Configuration/Error/mod.ts
 * Responsibility: Implements the core `Track` command dispatcher in the Mountain backend, routing requests from the Sky frontend and sidecar processes to registered service handlers via asynchronous channels.
 * Modified: 2025-06-09 15:50:45 UTC
 * Dependency: ./Problem.js
 * Export: ConfigurationProblem
 */

/**
 * @module Error (Configuration/Application)
 * @description This module serves as the public entry point for all errors
 * related to the Configuration application service. It aggregates and re-exports
 * the detailed error definitions from its sub-modules.
 */

import { Problem as ConfigurationProblemSource } from "./Problem.js";

/**
 * A domain-specific error representing a failure within the Configuration service.
 * @see Problem
 */
export const ConfigurationProblem = ConfigurationProblemSource;
export type ConfigurationProblem = ConfigurationProblemSource;
