// Integration/Tauri/Wrap/RequestHostWindowOpen.ts
// Purpose: Effect wrapper for VSCode HostService's openWindow method.

import type { Context } from "effect";

// Utility to wrap service methods
import { FromMethod } from "../../../Effect/Produce.js";
import {
	// The Tag for the HostService
	HostServiceTag,
	// PerformAction is HostServiceTag.Type essentially
	// type PerformAction as HostService,
} from "../../../Platform/VSCode/Provide.js";
// HostService definition
import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../../../Platform/VSCode/Type.js";
// VSCode specific types
// Custom error type
import { WindowProblem } from "../Error.js";

/**
 * Factory function to create a `WindowProblem` error.
 * @param cause The underlying cause of the error.
 * @returns A `WindowProblem` instance.
 */
const CreateProblem = (cause: unknown): WindowProblem =>
	new WindowProblem({ cause, operation: "hostServiceOpenWindow" });

// Infer the service interface type from the Tag
type HostServiceImpl = Context.Tag.Service<typeof HostServiceTag>;

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
 * on the `HostService` (obtained via `HostServiceTag`).
 * This abstracts the direct service call into a managed effect.
 * - `HostServiceImpl`: The interface of the service.
 * - `typeof HostServiceTag`: The actual Tag object.
 * - `"openWindow"`: The name of the method on `HostServiceImpl` to call.
 * - `OpenWindowArgs`: The type of arguments for the `openWindow` method.
 * - `void`: The return type of the `openWindow` method's promise.
 * - `{ operation: "hostServiceOpenWindow" }`: Static data for error creation.
 * - `WindowProblem`: The error type if the operation fails.
 */
const Request = FromMethod<
	HostServiceImpl,
	typeof HostServiceTag,
	// This must be a key of HostServiceImpl that is an async function
	"openWindow",
	OpenWindowArgs,
	void,
	// Static data for CreateProblem
	{ operation: "hostServiceOpenWindow" },
	WindowProblem
>(
	HostServiceTag,

	"openWindow",

	CreateProblem,

	// Static data passed to CreateProblem
	{ operation: "hostServiceOpenWindow" },
);

export default Request;
