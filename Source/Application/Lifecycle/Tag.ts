import { Context } from "effect";
import type { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle.js";

export type Interface = ILifecycleService;

const LifecycleServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/LifecycleService",
);

export default LifecycleServiceTag;
