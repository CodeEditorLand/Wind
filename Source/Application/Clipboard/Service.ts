/**
 * @module Service (Clipboard/Application)
 * @description Defines the service interface and Context.Tag for the application-level
 * clipboard service, which conforms to the `IClipboardService` from VS Code.
 */

import { Context } from "effect";
import type { IClipboardService } from "vs/platform/clipboard/common/clipboardService.js";

/**
 * The service interface for the Clipboard service.
 * This is an alias for VS Code's `IClipboardService` to ensure API compatibility.
 */
export type Interface = IClipboardService;

/**
 * The Context.Tag for the Clipboard service.
 * This tag is used to specify a dependency on the clipboard service in the Effect
 * ecosystem, and is identified by the string "vscode/ClipboardService".
 */
export class Tag extends Context.Tag("vscode/ClipboardService")<
	Interface,
	{}
>() {}
