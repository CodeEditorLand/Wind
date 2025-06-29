/**
 * @module WorkSpace (Integration/Tauri/Path)
 * @description Resolves the workspace path using Tauri's API.
 */

import { BaseDirectory, resolve } from "@tauri-apps/api/path";
import { Effect } from "effect";

import { URI, type Uri } from "../../../Platform/VSCode/Type.js";
import { IntegrationPathProblem } from "./Error.js";

/**
 * An Effect that resolves the path for workspace-specific settings.
 * For a standalone app, we can resolve this relative to the home directory
 * as a sensible default.
 */
export const ResolveWorkSpacePath = (): Effect.Effect<
	Uri,
	IntegrationPathProblem
> =>
	Effect.tryPromise({
		// In this context, we treat the "workspace" as the app's config dir.
		try: async () => {
			const WorkspaceConfigPath = await resolve(
				BaseDirectory.AppConfig.toString(),
			);
			return URI.file(WorkspaceConfigPath);
		},
		catch: (Cause) => new IntegrationPathProblem({ Cause }),
	});
