import { Context } from "effect";
import type { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";

const InstantiationServiceTag = Context.GenericTag<
	IInstantiationService,
	IInstantiationService
>("vscode/InstantiationService");

export default InstantiationServiceTag;

import { Context } from "effect";
import type { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";

export type Interface = IInstantiationService;

const InstantiationServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/InstantiationService",
);

export default InstantiationServiceTag;
