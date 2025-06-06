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
