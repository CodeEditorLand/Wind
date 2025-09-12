/**
 * @module Default
 * @description
 * Resolves the default application configuration path using Tauri's API.
 */

import { BaseDirectory, resolve } from "@tauri-apps/api/path";
import { Effect } from "effect";

import { URI, type Uri } from "../../../../Platform/Vscode/Type.js";
import { TauriPathProblem } from "./Problem.js";

/**
 * An Effect that resolves the path to the application's default configuration directory.
 * This is typically where user-level `settings.json` would reside.
 *
 * @returns An `Effect` that resolves to the `Uri` of the configuration directory,
 * or fails with a `TauriPathProblem`.
 */
export const ResolveDefaultPath = (): Effect.Effect<Uri, TauriPathProblem> =>
	Effect.tryPromise({
		try: async () => {
			const AppConfigPath = await resolve(
				BaseDirectory.AppConfig.toString(),
			);
			return URI.file(AppConfigPath);
		},
		catch: (Cause) =>
			new TauriPathProblem({
				Cause,
				Context: "ResolveDefaultPathFailed",
			}),
	});
