/**
 * @module ResolveConfiguration (Orchestrate)
 * @description A composed Effect for finding, loading, and merging all relevant
 * configuration files (user, workspace, etc.) into a single settings object.
 */

import { deepmerge } from "deepmerge-ts";
import { Effect, pipe } from "effect";
import { joinPath } from "vs/base/common/resources.js";

import {
	ParseJson,
	ReadRawFile,
	type IntegrationConfigurationProblem,
} from "../../../Integration/Tauri/Configuration/mod.js";
import {
	ResolveFinalDefaultPath,
	ResolveWorkspacePath,
	type IntegrationPathProblem,
	type Uri,
} from "../../../Integration/Tauri/Path/mod.js";
import { Problem as ApplicationConfigurationProblem } from "../Error/mod.js";

type ConfigurationError =
	| ApplicationConfigurationProblem
	| IntegrationConfigurationProblem
	| IntegrationPathProblem;

/**
 * An Effect that resolves a specific configuration file (e.g., 'settings.json')
 * from a given base directory Effect. It handles file reading and JSON parsing.
 */
const ResolveConfigurationFile = (
	ConfigDirectoryEffect: Effect.Effect<Uri, IntegrationPathProblem>,
	FileName: string,
): Effect.Effect<object, IntegrationConfigurationProblem> =>
	pipe(
		ConfigDirectoryEffect,
		Effect.flatMap((ConfigDirectory) =>
			pipe(
				ReadRawFile(joinPath(ConfigDirectory, FileName)),
				Effect.flatMap(ParseJson),
				// If the file doesn't exist or is invalid, treat it as an empty object.
				Effect.catchAll(() => Effect.succeed({})),
			),
		),
	);

/**
 * The main composed Effect to resolve the final, merged configuration.
 *
 * It orchestrates the following steps:
 * 1. Resolve the paths for the user-global and workspace configuration files.
 * 2. Concurrently fetch and parse both files.
 * 3. Perform a deep merge of the two, with workspace settings overriding global settings.
 * 4. Wraps all potential errors in a single, domain-specific error type.
 */
export const ResolveConfiguration = pipe(
	Effect.all(
		{
			// Concurrently resolve both the user global settings and workspace settings.
			User: ResolveConfigurationFile(
				ResolveFinalDefaultPath(),
				"settings.json",
			),
			Workspace: ResolveConfigurationFile(
				ResolveWorkspacePath(),
				"settings.json",
			),
		},
		{ concurrency: "unbounded" },
	),
	// Perform a deep merge. The `deepmerge` library correctly handles nested objects.
	Effect.map(({ User, Workspace }) => deepmerge(User, Workspace)),
	// Map any error from the underlying integration effects into our application-level error.
	Effect.mapError(
		(cause) =>
			new ApplicationConfigurationProblem({
				cause: cause as IntegrationConfigurationProblem,
				context: "FailedToResolveConfiguration",
			}),
	),
);
