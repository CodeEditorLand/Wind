/*
 * File: Wind/Source/Application/Host/NativeLive.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:38 UTC
 * Dependency: ./NativeDefinition.js, ./NativeTag.js, effect
 */

import { Layer } from "effect";

import Definition from "./NativeDefinition.js";
import ServiceTag from "./NativeTag.js";

const LiveNativeHostService: Layer.Layer<
	import("./NativeTag.js").Interface,
	never,
	never
> = Layer.succeed(ServiceTag, Definition);

export default LiveNativeHostService;
