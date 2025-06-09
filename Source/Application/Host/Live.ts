/*
 * File: Wind/Source/Application/Host/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:38 UTC
 * Dependency: ../../Platform/VSCode/Provide/Host.js, ./Definition.js, effect
 */

import { Layer, type Context } from "effect";

import ActualHostServiceTag from "../../Platform/VSCode/Provide/Host.js";
import Definition from "./Definition.js";

type HostServiceType = Context.Tag.Service<typeof ActualHostServiceTag>;

const Live: Layer.Layer<HostServiceType, never, never> = Layer.succeed(
	ActualHostServiceTag,
	Definition,
);

export default Live;
