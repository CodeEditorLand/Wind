// Integration/Tauri/Wrap/RequestHostWindowOpen.ts
// Purpose: Effect wrapper for VSCode HostService's openWindow method.

import { FromMethod } from "../../../Effect/Produce.js";
// The Tag for IHostService
import { Host as HostServiceTag } from "../../../Platform/VSCode/Provide.js";
import { WindowProblem } from "../Error.js";

const CreateProblem = (cause: unknown): WindowProblem =>
	new WindowProblem({ cause, operation: "hostServiceOpenWindow" });

/**
 * @module RequestHostWindowOpen
 * @description Effect to open a window using the VSCode HostService.
 * Requires HostService (PerformHostAction) from context.
 */
const Request = FromMethod(
	// Use the Tag
	HostServiceTag,

	// Method name on PerformHostAction interface
	"openWindow",

	CreateProblem,

	{ operation: "hostServiceOpenWindow" },
);

export default Request;
