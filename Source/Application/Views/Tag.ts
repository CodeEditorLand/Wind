/*
 * File: Wind/Source/Application/Views/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:25 UTC
 * Dependency: effect, vs/workbench/common/views.js
 * Export: Interface
 */

import { Context } from "effect";
import type { IViewDescriptorService } from "vs/workbench/common/views.js";

export type Interface = IViewDescriptorService;

const ViewDescriptorServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/ViewDescriptorService",
);

export default ViewDescriptorServiceTag;
