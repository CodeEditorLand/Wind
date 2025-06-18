/*
 * File: Wind/Source/Application/TextEditor/Live.ts
 * Responsibility:
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: ../File/mod.js, ../Instantiation/mod.js, ./Definition.js, ./Service.js, effect
 */

/**
 * @module Live (TextEditor/Application)
 * @description Provides the "live" implementation of the ITextEditorService as a Layer.
 */
import { Layer } from "effect";

import { File } from "../File/mod.js";
import { Instantiation } from "../Instantiation/mod.js";
import { Definition } from "./Definition.js";
import { Tag } from "./Service.js";

/**
 * The live implementation Layer for the TextEditor service.
 *
 * It has context requirements for the services needed by its definition.
 */
const Live: Layer.Layer<
	import("./Service.js").Interface,
	never,
	Instantiation.Interface | File.Interface // | UntitledTextEditorService.Interface
> = Layer.effect(Tag, Definition);

export default Live;
