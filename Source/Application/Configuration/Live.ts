/*
 * File: Wind/Source/Application/Configuration/Live.ts
 * Responsibility: Provides the live implementation Layer for the Configuration service in the Sky frontend, resolving application settings at startup and handling errors from configuration logic, Tauri integration, and path resolution.
 * Modified: 2025-06-09 15:50:45 UTC
 * Dependency: ../../../Integration/Tauri/Configuration/Error.js, ../../../Integration/Tauri/Path/Error.js, ./Definition.js, ./Error/mod.js, ./Service.js, effect
 */

/**
 * @module Live (Configuration/Application)
 * @description Provides the "live" implementation of the IConfigurationService as a Layer.
 */
import { Layer } from "effect";

import type { IntegrationConfigurationProblem } from "../../../Integration/Tauri/Configuration/Error.js";
import type { IntegrationPathProblem } from "../../../Integration/Tauri/Path/Error.js";
import { Definition } from "./Definition.js";
import type { ConfigurationProblem } from "./Error/mod.js";
import { Tag } from "./Service.js";

type LiveConfigurationError =
	| ConfigurationProblem
	| IntegrationPathProblem
	| IntegrationConfigurationProblem;

/**
 * The live implementation Layer for the Configuration service.
 *
 * It uses `Layer.effect` to construct the service instance from its definition,
 * which is an `Effect` that resolves the application's settings on startup.
 * The Layer's error channel includes all possible errors from the underlying
 * integration services (like file system or path resolution errors).
 */
const Live: Layer.Layer<
	import("./Service.js").Interface,
	LiveConfigurationError,
	never
> = Layer.effect(Tag, Definition);

export default Live;
