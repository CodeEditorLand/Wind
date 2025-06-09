/*
 * File: Wind/Source/Application/PaneComposite/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:30 UTC
 * Dependency: effect, vs/workbench/services/panecomposite/browser/panecomposite.js
 * Export: Interface
 */

import { Context } from "effect";
import type { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite.js";

export type Interface = IPaneCompositePartService;

const PaneCompositeServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/PaneCompositePartService",
);

export default PaneCompositeServiceTag;
