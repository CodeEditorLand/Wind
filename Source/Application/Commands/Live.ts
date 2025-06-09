/*
 * File: Wind/Source/Application/Commands/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:47 UTC
 * Dependency: ./Definition.js, ./Ref.js, ./Register.js, ./Tag.js, effect
 */

import { Layer } from "effect";

import Definition from "./Definition.js";
import { CommandRegistryRef } from "./Ref.js";
import type { CommandEffect } from "./Register.js";
import ServiceTag from "./Tag.js";

const LiveCommandService: Layer.Layer<
	import("./Tag.js").Interface,
	never,
	never
> = Layer.effect(ServiceTag, Definition).pipe(
	Layer.provide(
		Layer.succeed(
			CommandRegistryRef,
			new Map<string, CommandEffect<any, any>>(),
		),
	),
);

export default LiveCommandService;
