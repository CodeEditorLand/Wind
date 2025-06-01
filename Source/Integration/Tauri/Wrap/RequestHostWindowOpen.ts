// Integration/Tauri/Wrap/RequestHostWindowOpen.ts
// Purpose: Effect wrapper for VSCode HostService's openWindow method.

import type { Context } from "effect";

import { FromMethod } from "../../../Effect/Produce.js";
import {
	// This is the Tag instance: Context.Tag<PerformAction>
	HostServiceTag,
	// PerformAction is HostServiceTag.Type essentially
	// type PerformAction as HostService,
} from "../../../Platform/VSCode/Provide.js";
import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../../../Platform/VSCode/Type.js";
import { WindowProblem } from "../Error.js";

const CreateProblem = (cause: unknown): WindowProblem =>
	new WindowProblem({ cause, operation: "hostServiceOpenWindow" });

type HostServiceImpl = Context.Tag.Service<typeof HostServiceTag>;

type OpenWindowArgs = [
	targets: ReadonlyArray<
		| FolderOpenSpecification
		| FileOpenSpecification
		| WorkspaceOpenSpecification
	>,

	config?: WindowOpenOption,
];

// For FromMethod<Interface, TagType, ...>
// Interface should be HostServiceImpl
// TagType should be typeof HostServiceTag
const Request = FromMethod<
	HostServiceImpl,
	typeof HostServiceTag,
	"openWindow",
	OpenWindowArgs,
	void,
	{ operation: "hostServiceOpenWindow" },
	WindowProblem
>(HostServiceTag, "openWindow", CreateProblem, {
	operation: "hostServiceOpenWindow",
});

export default Request;
