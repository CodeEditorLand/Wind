/*
 * File: Wind/Source/Application/Workspaces/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:24 UTC
 * Dependency: ./Definition.js, ./Tag.js, effect
 */

import { Layer } from "effect";
import ServiceTag from "./Tag.js";
import Definition from "./Definition.js";

const LiveWorkspacesService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveWorkspacesService;

import { Layer } from "effect";
import ServiceTag from "./Tag.js";
import Definition from "./Definition.js";

const LiveWorkspacesService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveWorkspacesService;
