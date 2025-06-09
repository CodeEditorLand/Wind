/*
 * File: Wind/Source/Application/Workbench/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 08:56:51 UTC
 * Dependency: effect, vs/workbench/services/layout/browser/layoutService.js
 * Export: Interface, LayoutServiceTag
 */

// Source/Application/Workbench/Tag.ts
import { Context } from "effect";
import type { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService.js";

// The Workbench provides the Layout service, so we create a Tag for it.
export const LayoutServiceTag = Context.Tag<IWorkbenchLayoutService>(
	"vscode/WorkbenchLayoutService",
);

// We can also define a Tag for the Workbench itself if other parts need to access it.
export interface Interface extends IWorkbenchLayoutService {
	readonly _workbenchBrand: undefined;
}

const WorkbenchTag = Context.Tag<Interface>("wind/Workbench");

export default WorkbenchTag;
