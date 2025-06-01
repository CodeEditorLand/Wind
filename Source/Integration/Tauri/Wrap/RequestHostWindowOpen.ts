// Integration/Tauri/Wrap/RequestHostWindowOpen.ts
// Purpose: Effect wrapper for VSCode HostService's openWindow method.

// Import Context
import type { Context } from "effect";

import { FromMethod } from "../../../Effect/Produce.js";
import {
	// This is the Tag instance
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

const Request = FromMethod<
	// Interface type
	HostServiceImpl,
	// The Tag instance
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
