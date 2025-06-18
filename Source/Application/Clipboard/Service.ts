/*
 * File: Wind/Source/Application/Clipboard/Service.ts
 * Responsibility: Defines the clipboard service interface and its Effect Context Tag for the Wind compatibility layer, ensuring the clipboard service conforms to VS Code's `IClipboardService` for consistent extension behavior.
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: effect, vs/platform/clipboard/common/clipboardService.js
 * Export: Interface, Tag
 */

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
export const Tag = Context.Tag<Interface>("vscode/ClipboardService");
