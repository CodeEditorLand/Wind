import { invoke } from "@tauri-apps/api/tauri";
import { Effect } from "effect";

import { ViewStateProblem } from "../Error.js";

const StoreViewCustomizations = (
	Customizations: any,
): Effect.Effect<void, ViewStateProblem> =>
	Effect.tryPromise({
		try: () =>
			invoke<void>("mountain_store_view_customizations", {
				Customizations,
			}),
		catch: (cause) => new ViewStateProblem({ cause, operation: "store" }),
	});

export default StoreViewCustomizations;
