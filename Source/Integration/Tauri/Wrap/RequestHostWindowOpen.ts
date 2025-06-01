// Integration/Tauri/Wrap/RequestHostWindowOpen.ts
// Purpose: Effect wrapper for VSCode HostService's openWindow method.

// No need to import PerformAction interface if FromMethod correctly infers SourcedService
// Used for Context.Tag.Service for type inference clarity
import type { Context } from "effect";

import { FromMethod } from "../../../Effect/Produce.js";
// This is Tag<PerformAction, PerformAction>
import HostServiceTag from "../../../Platform/VSCode/Provide/Host.js";
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
	// SourcedTagInstance: The Tag object itself
	typeof HostServiceTag,
	// SourcedService: PerformAction, inferred explicitly
	Context.Tag.Service<typeof HostServiceTag>,
	// Method name
	"openWindow",
	// Arguments type
	OpenWindowArgs,
	// Return type of the Promise
	void,
	// Static error data
	{ operation: "hostServiceOpenWindow" },
	// Error type
	WindowProblem
>(
	// Argument for ServiceTag parameter
	HostServiceTag,

	"openWindow",

	CreateProblem,

	{ operation: "hostServiceOpenWindow" },
);

// Type of Request: (...args: OpenWindowArgs) => Effect.Effect<void, WindowProblem, typeof HostServiceTag>

export default Request;
