import { Context } from "effect";
import type { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService.js";

const LayoutServiceTag = Context.GenericTag<
	IWorkbenchLayoutService,
	IWorkbenchLayoutService
>("vscode/WorkbenchLayoutService");

export default LayoutServiceTag;
