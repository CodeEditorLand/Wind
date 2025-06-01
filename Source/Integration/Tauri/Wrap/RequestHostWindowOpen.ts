// Integration/Tauri/Wrap/RequestHostWindowOpen.ts
// Purpose: Effect wrapper for VSCode HostService's openWindow method.

// No need to import PerformAction interface if FromMethod correctly infers SourcedService
import type { Context } from "effect"; // Used for Context.Tag.Service for type inference clarity

import { FromMethod } from "../../../Effect/Produce.js";
import HostServiceTag from "../../../Platform/VSCode/Provide/Host.js"; // This is Tag<PerformAction, PerformAction>

import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../../../Platform/VSCode/Type.js";
import { WindowProblem } from "../Error.js";

const CreateProblem = (cause: unknown): WindowProblem =>
	new WindowProblem({ cause, operation: "hostServiceOpenWindow" });

// Define the argument structure for the 'openWindow' method
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
 * @description An Effect that, when executed, calls the `openWindow` method
 * on the service identified by `HostServiceTag`.
 * The resulting Effect will require `HostServiceTag` in its context.
 */
const Request = FromMethod<
	typeof HostServiceTag, // SourcedTagInstance: The Tag object itself
	Context.Tag.Service<typeof HostServiceTag>, // SourcedService: PerformAction, inferred explicitly
	"openWindow", // Method name
	OpenWindowArgs, // Arguments type
	void, // Return type of the Promise
	{ operation: "hostServiceOpenWindow" }, // Static error data
	WindowProblem // Error type
>(
	HostServiceTag, // Argument for ServiceTag parameter
	"openWindow",
	CreateProblem,
	{ operation: "hostServiceOpenWindow" },
);
// Type of Request: (...args: OpenWindowArgs) => Effect.Effect<void, WindowProblem, typeof HostServiceTag>

export default Request;
