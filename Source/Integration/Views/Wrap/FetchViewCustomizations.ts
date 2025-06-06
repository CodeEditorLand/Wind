import { invoke } from "@tauri-apps/api/tauri";
import { Effect } from "effect";

import { ViewStateProblem } from "../Error.js";

// Represents the shape of the data stored and retrieved from the backend.
interface IViewsCustomizations {
	readonly viewContainerLocations: Record<string, any>;
	readonly viewLocations: Record<string, string>;
}

const FetchViewCustomizations = Effect.tryPromise({
	try: () => invoke<IViewsCustomizations>("mountain_get_view_customizations"),
	catch: (cause) => new ViewStateProblem({ cause, operation: "fetch" }),
});

export default FetchViewCustomizations;
