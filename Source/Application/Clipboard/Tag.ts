/*
 * File: Wind/Source/Application/Clipboard/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:48 UTC
 * Dependency: effect, vs/platform/clipboard/common/clipboardService.js
 * Export: Interface
 */

import { Context } from "effect";
import type { IClipboardService } from "vs/platform/clipboard/common/clipboardService.js";

export type Interface = IClipboardService;

const ClipboardServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/ClipboardService",
);

export default ClipboardServiceTag;

import { Context } from "effect";
import type { IClipboardService } from "vs/platform/clipboard/common/clipboardService.js";

export type Interface = IClipboardService;

const ClipboardServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/ClipboardService",
);

export default ClipboardServiceTag;
