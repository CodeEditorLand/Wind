/*
 * File: Wind/Source/Application/Editor/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:43 UTC
 * Dependency: effect, vs/workbench/services/editor/common/editorService.js
 * Export: Interface
 */

import { Context } from "effect";
import type { IEditorService } from "vs/workbench/services/editor/common/editorService.js";

export type Interface = IEditorService;

const EditorServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/EditorService",
);

export default EditorServiceTag;
