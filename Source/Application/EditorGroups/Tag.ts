/*
 * File: Wind/Source/Application/EditorGroups/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:42 UTC
 * Dependency: effect, vs/workbench/services/editor/common/editorGroupsService.js
 * Export: Interface
 */

import { Context } from "effect";
import type { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService.js";

export type Interface = IEditorGroupsService;

const EditorGroupsServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/EditorGroupsService",
);

export default EditorGroupsServiceTag;
