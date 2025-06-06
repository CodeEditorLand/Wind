import { Context } from "effect";
import type { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService.js";

export type Interface = IEditorGroupsService;

const EditorGroupsServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/EditorGroupsService",
);

export default EditorGroupsServiceTag;
