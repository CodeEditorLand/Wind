/**
 * @module ReadText (Clipboard/Wrap/Integration)
 * @description Provides a declarative Effect for reading text from the system
 * clipboard by wrapping the native Tauri API.
 */

import { readText as ReadTextFromTauri } from "@tauri-apps/api/clipboard";

import { FromAsync } from "../../../../Effect/Produce.js";
import { IntegrationClipboardProblem } from "../Error/mod.js";

/**
 * An error constructor specific to the `ReadText` operation.
 */
const CreateProblem = (cause: unknown) =>
	new IntegrationClipboardProblem({ cause, operation: "ReadText" });

/**
 * An Effect that, when executed, reads the current text content from the
 * system clipboard.
 *
 * It wraps the `readText` function from `@tauri-apps/api/clipboard` and
 * translates any potential promise rejection into a structured
 * `IntegrationClipboardProblem`.
 *
 * @returns An `Effect<string, IntegrationClipboardProblem>`.
 */
export const ReadText = FromAsync(ReadTextFromTauri, CreateProblem, {
	operation: "ReadText",
});
