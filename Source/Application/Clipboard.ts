/*
 * File: Wind/Source/Application/Clipboard.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:48 UTC
 * Export: default, type Interface
 */

export { default as LiveClipboardService } from "./Clipboard/Live.js";
export {
	default as ClipboardServiceTag,
	type Interface as Clipboard,
} from "./Clipboard/Tag.js";
