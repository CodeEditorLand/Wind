import { Context } from "effect";
import type { IPaneCompositePartService } from "vs/workbench/services/panecomposite/browser/panecomposite.js";

export type Interface = IPaneCompositePartService;

const PaneCompositeServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/PaneCompositePartService",
);

export default PaneCompositeServiceTag;
