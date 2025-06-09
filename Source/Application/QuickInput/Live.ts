/*
 * File: Wind/Source/Application/QuickInput/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:28 UTC
 * Dependency: ./Definition.js, ./Tag.js, effect
 */

import { Layer } from "effect";

import Definition from "./Definition.js";
import ServiceTag from "./Tag.js";

const LiveQuickInputService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveQuickInputService;
