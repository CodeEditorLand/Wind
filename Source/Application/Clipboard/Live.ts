/*
 * File: Wind/Source/Application/Clipboard/Live.ts
 * Responsibility: Provides the live implementation of the clipboard service as an Effect Layer for the Sky frontend, enabling interaction with the system clipboard via Tauri's JavaScript bindings.
 * Modified: 2025-06-18 14:32:33 UTC
 * Dependency: ../../../Integration/Tauri/Clipboard/Error.js, ./Definition.js, ./Error.js, ./Tag.js, effect
 */

/**
 * @module Live (Clipboard/Application)
 * @description Provides the "live" implementation of the IClipboardService as a Layer.
 */
import { Layer } from "effect";

import type { IntegrationClipboardProblem } from "../../../Integration/Tauri/Clipboard/Error.js";
import { Definition } from "./Definition.js";
import type { ClipboardProblem } from "./Error.js";
import { Tag } from "./Tag.js";

/**
 * The live implementation Layer for the Clipboard service.
 *
 * It uses `Layer.effect` to construct the service instance from its definition,
 * which is an `Effect`. This layer has no external dependencies as the Definition
 * it uses is self-contained.
 */
const Live: Layer.Layer<
	import("./Service.js").Interface,
	ClipboardProblem | IntegrationClipboardProblem,
	never
> = Layer.effect(Tag, Definition);

export default Live;
