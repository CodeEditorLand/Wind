import { Context } from "effect";
import type { IViewDescriptorService } from "vs/workbench/common/views.js";

export type Interface = IViewDescriptorService;

const ViewDescriptorServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/ViewDescriptorService",
);

export default ViewDescriptorServiceTag;
