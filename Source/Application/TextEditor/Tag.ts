/*
 * File: Wind/Source/Application/TextEditor/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:26 UTC
 * Dependency: effect, vs/workbench/services/textfile/common/textEditorService.js
 */

import { Context } from "effect";
import type { ITextEditorService } from "vs/workbench/services/textfile/common/textEditorService.js";

const TextEditorServiceTag = Context.GenericTag<
	ITextEditorService,
	ITextEditorService
>("vscode/TextEditorService");

export default TextEditorServiceTag;
