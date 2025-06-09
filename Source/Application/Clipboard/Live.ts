/*
 * File: Wind/Source/Application/Clipboard/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:48 UTC
 * Dependency: ./Definition.js, ./Tag.js, effect
 */

import { Layer } from "effect";
import ServiceTag from "./Tag.js";
import Definition from "./Definition.js";

const LiveClipboardService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveClipboardService;

import { Layer } from "effect";
import ServiceTag from "./Tag.js";
import Definition from "./Definition.js";

const LiveClipboardService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveClipboardService;
