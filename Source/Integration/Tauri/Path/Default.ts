/**
 * @module Default (Integration/Tauri/Path)
 * @description Resolves the default application configuration path using Tauri's API.
 */

import { Effect } from "effect";
import { resolve, BaseDirectory } from "@tauri-apps/api/path";
import { URI, type Uri } from "Source/Platform/VSCode/Type.js";
import { IntegrationPathProblem } from "./Error.js";

/**
 * An Effect that resolves the path to the application's configuration directory.
 * This is typically where user-level `settings.json` would reside.
 */
export const ResolveFinalDefaultPath = (): Effect.Effect<
	Uri,
	IntegrationPathProblem
> =>
	Effect.tryPromise({
		try: async () => {
			const AppConfigPath = await resolve(
				BaseDirectory.AppConfig.toString(),
			);
			return URI.file(AppConfigPath);
		},
		catch: (Cause) => new IntegrationPathProblem({ Cause }),
	});
