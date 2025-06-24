/*
 * File: Wind/Source/Application/Clipboard/Live.ts
 * Role: Provides the "live" implementation Layer for the Clipboard service.
 * Responsibilities:
 *   - Defines the `Layer` that constructs the live `Clipboard` service instance
 *     from its `Definition`.
 */

import { Layer } from "effect";
import { Definition } from "./Definition.js";
import { Clipboard } from "./Service.js";
import type { IntegrationClipboardProblem } from "Source/Integration/Tauri/Clipboard/Error.js";
import type { ApplicationClipboardProblem } from "./Error.js";

/**
 * The live implementation `Layer` for the `Clipboard` service.
 *
 * This layer is self-contained and has no external service dependencies, as its
 * `Definition` creates a class instance that encapsulates all necessary logic.
 * The error channel reflects potential problems from both the application and
 * integration layers.
 */
const Live: Layer.Layer<
	Clipboard,
	ApplicationClipboardProblem | IntegrationClipboardProblem,
	never
> = Layer.effect(Clipboard, Definition);

export default Live;
