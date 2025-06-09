/*
 * File: Wind/Source/Integration/Tauri/Wrap/FetchUntitledWorkspacesHome.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:13 UTC
 * Dependency: ../../../Platform/VSCode/Type.js, ../Error.js, @tauri-apps/api/tauri, effect
 */

import { invoke } from "@tauri-apps/api/tauri";
import { Effect } from "effect";

import { Uri, UriConstructor } from "../../../Platform/VSCode/Type.js";
import { PathProblem } from "../Error.js";

const CreateProblem = (cause: unknown) =>
	new PathProblem({ cause, operation: "get_untitled_workspaces_home" });

const FetchUntitledWorkspacesHome = Effect.tryPromise({
	try: () => invoke<string>("mountain_get_untitled_workspaces_home"),
	catch: CreateProblem,
}).pipe(Effect.map((Path) => UriConstructor.parse(Path)));

export default FetchUntitledWorkspacesHome;
