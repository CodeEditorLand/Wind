/**
 * @module Effect/Clipboard/Tag/ClipboardServiceTag
 * @description
 * Service tag for dependency injection of the Clipboard service.
 * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
 * @see {@link Effect/Clipboard/Implementation/ClipboardImplementation} Implementation
 * @category Tag
 */

import { Context } from "effect";

import type { ClipboardService } from "../Interface/ClipboardService.js";

// ============================================================================
// Service Tag
// ============================================================================

/**
 * Clipboard service tag for dependency injection
 */
export class ClipboardServiceTag extends Context.Tag(
	"Application/ClipboardService",
)<ClipboardServiceTag, ClipboardService>() {}

/**
 * Alias for the Clipboard service tag
 */
export const Clipboard = ClipboardServiceTag;

export default ClipboardServiceTag;
