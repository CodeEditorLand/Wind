// Integration/Tauri/Wrap/RequestHostWindowOpen.ts
// Purpose: Effect wrapper for VSCode HostService's openWindow method.

import { FromMethod } from "../../../Effect/Produce.js";
// The Tag for IHostService
import {
	HostServiceTag,
	type PerformAction as HostService,
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

/**
 * @module RequestHostWindowOpen
 * @description Effect to open a window using the VSCode HostService.
 * Requires HostService (PerformAction) from context.
 */
const Request = FromMethod<
	// Identifier string for the Tag
	typeof HostServiceTag.id,
	// Service Interface
	HostService,
	// The Tag instance itself
	typeof HostServiceTag,
	// Method name
	"openWindow",
	// Arguments tuple type
	OpenWindowArgs,
	// Return type of the promise
	void,
	// ErrorData
	{ operation: "hostServiceOpenWindow" },
	// ErrorType
	WindowProblem
>(HostServiceTag, "openWindow", CreateProblem, {
	operation: "hostServiceOpenWindow",
});

export default Request;
