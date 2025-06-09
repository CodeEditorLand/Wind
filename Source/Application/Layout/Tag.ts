/*
 * File: Wind/Source/Application/Layout/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:34 UTC
 * Dependency: effect, vs/workbench/services/layout/browser/layoutService.js
 */

import { Context } from "effect";
import type { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService.js";

const LayoutServiceTag = Context.GenericTag<
	IWorkbenchLayoutService,
	IWorkbenchLayoutService
>("vscode/WorkbenchLayoutService");

export default LayoutServiceTag;
