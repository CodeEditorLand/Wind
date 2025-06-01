// Integration/Tauri/Wrap/RequestHostWindowOpen.ts
// Purpose: Effect wrapper for VSCode HostService's openWindow method.

import { FromMethod } from "../../../Effect/Produce.js";
import {
	HostServiceTag,
	// Renamed to avoid conflict with module name
	type HostService as ActualHostService,
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
	ActualHostService,
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
