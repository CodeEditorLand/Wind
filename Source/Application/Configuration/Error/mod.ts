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
