/**
 * @module Service (TextEditor/Application)
 * @description Defines the service interface and Context.Tag for the TextEditor service.
 */

import { Context } from "effect";
import type { ITextEditorService } from "vs/workbench/services/textfile/common/textEditorService.js";

/**
 * The service interface for the TextEditor service.
 * This is an alias for VS Code's `ITextEditorService`.
 */
export type Interface = ITextEditorService;

/**
 * The Context.Tag for the TextEditor service.
 */
export class Tag extends Context.Tag("vscode/TextEditorService")<
	Interface,
	{}
>() {}
