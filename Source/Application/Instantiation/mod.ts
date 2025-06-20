

/**
 * @module Instantiation
 * @description This module provides the `IInstantiationService` implementation,
 * which is a critical bridge between VS Code's legacy class-based dependency
 * injection and Effect-TS's modern context-based dependency management. It
 * aggregates and exports the complete public API for the service.
 */

import { Problem as InstantiationServiceProblem } from "./Error/mod.js";
import { Live as LiveInstantiationServiceLayer } from "./Live.js";
import {
	RegisterService as RegisterServiceWithLayer,
	LayerMap as ServiceLayerMap,
} from "./Register.js";
import {
	Tag as InstantiationServiceTag,
	type Interface as InstantiationServiceInterface,
} from "./Service.js";

/**
 * The `Context.Tag` for the Instantiation service.
 * @see Service.Interface
 */
export const Tag = InstantiationServiceTag;
export type Interface = InstantiationServiceInterface;

/**
 * The live implementation `Layer` for the Instantiation service.
 * @see Live
 */
export const Live = LiveInstantiationServiceLayer;

/**
 * The domain-specific error for Instantiation service operations.
 * @see Error.Problem
 */
export const Problem = InstantiationServiceProblem;
export type Problem = InstantiationServiceProblem;

/**
 * A helper function to associate a legacy VS Code class constructor with its
 * modern `Effect.Layer` implementation. This populates the `LayerMap`.
 * @see Register
 */
export const RegisterService = RegisterServiceWithLayer;

/**
 * The global map that stores the association between legacy service
 * constructors and their `Effect.Layer` implementations.
 * @see Register
 */
export const LayerMap = ServiceLayerMap;
