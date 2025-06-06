import { Context } from "effect";
import type { INativeHostService } from "vs/platform/native/common/native.js";

export type Interface = INativeHostService;

const NativeHostServiceTag = Context.GenericTag<Interface, Interface>(
	"vscode/NativeHostService",
);

export default NativeHostServiceTag;
