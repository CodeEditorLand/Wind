// Source/Application/Instantiation/Tag.ts
import { Context } from "effect";
import type { IInstantiationService as VsCodeInstantiationService } from "vs/platform/instantiation/common/instantiation.js";

// The Interface remains the same for API compatibility with VS Code's workbench.
export type Interface = VsCodeInstantiationService;

// We create a `Context.Tag` to identify this service within Effect's context map.
// This is the modern, type-safe equivalent of a DI token.
const InstantiationServiceTag = Context.Tag<Interface>(
	"vscode/InstantiationService",
);

export default InstantiationServiceTag;
