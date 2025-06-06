import { Context } from "effect";
import type { IQuickInputService } from "vs/platform/quickinput/common/quickInput.js";

export type Interface = IQuickInputService;

const QuickInputServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/QuickInputService",
);

export default QuickInputServiceTag;
