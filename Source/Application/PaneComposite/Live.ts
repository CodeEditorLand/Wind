/*
 * File: Wind/Source/Application/PaneComposite/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:30 UTC
 * Dependency: ./Definition.js, ./Tag.js, effect
 */

import { Layer } from "effect";

import Definition from "./Definition.js";
import ServiceTag from "./Tag.js";

const LivePaneCompositeService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.effect(ServiceTag, Definition);

export default LivePaneCompositeService;
