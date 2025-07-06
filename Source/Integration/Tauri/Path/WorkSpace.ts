/**
 * @module WorkSpace
 * @description
 * Resolves the workspace path using Tauri's API.
 */

import { BaseDirectory, resolve } from "@tauri-apps/api/path";
import { Effect } from "effect";

import { URI, type Uri } from "../../../../Platform/Vscode/Type.js";
import { TauriPathProblem } from "./Problem.js";

/**
 * An Effect that resolves the path for workspace-specific settings.
 * For a standalone app, we can resolve this relative to the home directory
 * as a sensible default. In a real-world scenario, this would likely take
 * the opened folder as an argument.
 *
 * @returns An `Effect` that resolves to the `Uri` of the workspace configuration directory,
 * or fails with a `TauriPathProblem`.
 */
export const ResolveWorkSpacePath = (): Effect.Effect<Uri, TauriPathProblem> =>
	Effect.tryPromise({
		// In this context, we treat the "workspace" as the app's config dir.
		try: async () => {
			const WorkspaceConfigPath = await resolve(
				BaseDirectory.AppConfig.toString(),
			);
			return URI.file(WorkspaceConfigPath);
		},
		catch: (Cause) =>
			new TauriPathProblem({
				Cause,
				Context: "ResolveWorkSpacePathFailed",
			}),
	});
