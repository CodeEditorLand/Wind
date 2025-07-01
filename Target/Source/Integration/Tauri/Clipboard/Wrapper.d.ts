/**
 * @module Wrapper (Integration/Tauri/Clipboard)
 * @description Provides declarative `Effect` wrappers for Tauri's clipboard plugin.
 */
import { Effect } from "effect";

import type { Uri } from "../../../Platform/VSCode/Type.js";
import { IntegrationClipboardProblem } from "./Error.js";

/** An Effect that reads text from the system clipboard. */
export declare const ReadText: Effect.Effect<
	string,
	IntegrationClipboardProblem,
	never
>;
/** An Effect that writes text to the system clipboard. */
export declare const WriteText: (
	Text: string,
) => Effect.Effect<void, IntegrationClipboardProblem>;
export declare const ReadImage: Effect.Effect<
	never,
	IntegrationClipboardProblem,
	never
>;
export declare const WriteImage: (
	_Image: Uint8Array,
) => Effect.Effect<void, IntegrationClipboardProblem>;
export declare const ReadResourceList: Effect.Effect<VSCodeURI[], never, never>;
export declare const WriteResourceList: (
	_Resources: Uri[],
) => Effect.Effect<void, IntegrationClipboardProblem>;
export declare const HasResourceList: Effect.Effect<boolean, never, never>;
