// Integration/Tauri/Wrap/RequestHostWindowOpen.ts

// Needed for SourcedIdentifier
import type { Context } from "effect"; // For Context.Tag.Service and Context.Tag.Identifier

import { FromMethod } from "../../../Effect/Produce.js";
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
	typeof HostServiceTag, // SourcedTagInstance
	Context.Tag.Service<typeof HostServiceTag>, // SourcedService (PerformAction)
	Context.Tag.Identifier<typeof HostServiceTag>, // SourcedIdentifier (PerformAction)
	"openWindow",
	OpenWindowArgs,
	void,
	{ operation: "hostServiceOpenWindow" },
	WindowProblem
>(HostServiceTag, "openWindow", CreateProblem, {
	operation: "hostServiceOpenWindow",
});
// Return type: (...args) => Effect.Effect<void, WindowProblem, PerformAction>
export default Request;
