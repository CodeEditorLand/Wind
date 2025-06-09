/*
 * File: Wind/Source/Application/Configuration/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:46 UTC
 * Dependency: ./Definition.js, ./Tag.js, effect
 */

import { Layer } from "effect";

import Definition from "./Definition.js";
import ServiceTag from "./Tag.js";

const LiveConfigurationService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	| import("../../../Integration/Tauri.js").PathProblem
	| import("../../../Integration/Configuration.js").JsonParseProblem
	| import("../../../Integration/Configuration.js").FileSystemProblem
> = Layer.effect(ServiceTag, Definition);

export default LiveConfigurationService;
