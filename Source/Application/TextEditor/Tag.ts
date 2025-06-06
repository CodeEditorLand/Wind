import { Context } from "effect";
import type { ITextEditorService } from "vs/workbench/services/textfile/common/textEditorService.js";

const TextEditorServiceTag = Context.GenericTag<
	ITextEditorService,
	ITextEditorService
>("vscode/TextEditorService");

export default TextEditorServiceTag;
