import { Context } from "effect";
import type { IEditorService } from "vs/workbench/services/editor/common/editorService.js";

export type Interface = IEditorService;

const EditorServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/EditorService",
);

export default EditorServiceTag;
